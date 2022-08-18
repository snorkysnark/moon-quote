#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod commands;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::app_data_dir,
            commands::path_exists
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
