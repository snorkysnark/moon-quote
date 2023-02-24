#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod commands;
mod deeplink;
mod error;
mod library;
mod local_server;
mod utils;

use tauri::{
    CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem,
    WindowEvent,
};

use deeplink::{DeeplinkClient, Message, TargetUrl};

fn main() {
    let target_url: Option<TargetUrl> = std::env::args()
        .nth(1)
        .map(|url_string| url_string.parse().expect("Invalid URL"));

    match DeeplinkClient::new() {
        Ok(mut client) => {
            eprintln!("Sending message to existing server");
            let message = match target_url {
                Some(target) => Message::GoToTarget(target),
                None => Message::Focus,
            };
            client
                .send_message(&message)
                .expect("Failed to send message to server");
        }
        Err(err) => {
            eprintln!("Can't connect to existing server: {err}");

            let tray = SystemTray::new().with_menu(
                SystemTrayMenu::new()
                    .add_item(CustomMenuItem::new("show".to_owned(), "Show"))
                    .add_native_item(SystemTrayMenuItem::Separator)
                    .add_item(CustomMenuItem::new("quit".to_owned(), "Quit")),
            );

            tauri::Builder::default()
                .plugin(library::plugin())
                .plugin(deeplink::plugin(target_url))
                .plugin(local_server::plugin())
                .invoke_handler(tauri::generate_handler![commands::open_folder])
                .system_tray(tray)
                .on_system_tray_event(|app, event| match event {
                    SystemTrayEvent::LeftClick { .. } => {
                        app.get_window("main").unwrap().show().unwrap();
                    }
                    SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                        "show" => {
                            app.get_window("main").unwrap().show().unwrap();
                        }
                        "quit" => {
                            std::process::exit(0);
                        }
                        _ => {}
                    },
                    _ => {}
                })
                .on_window_event(|event| match event.event() {
                    WindowEvent::CloseRequested { api, .. } => {
                        let window = event.window();
                        if window.label() == "main" {
                            window.hide().unwrap();
                            api.prevent_close();
                        }
                    }
                    _ => {}
                })
                .run(tauri::generate_context!())
                .expect("error while running tauri application");
        }
    }
}
