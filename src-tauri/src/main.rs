#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::{fs, path::PathBuf};

use deeplink::{AnnotationUrl, DeeplinkClient, Message};

use crate::deeplink::DeeplinkPlugin;

mod db;
mod deeplink;
mod error;
mod library;

pub struct Constants {
    library_path: PathBuf,
}

fn main() {
    let goto_annotation: Option<AnnotationUrl> = std::env::args()
        .nth(1)
        .map(|url_string| url_string.parse().expect("Invalid URL"));

    match DeeplinkClient::new() {
        Ok(mut client) => {
            eprintln!("Sending message to existing server");
            let message = match goto_annotation {
                Some(goto_annotation) => Message::GoToAnnotation(goto_annotation),
                None => Message::Focus,
            };
            client
                .send_message(&message)
                .expect("Failed to send message to server");
        }
        Err(err) => {
            eprintln!("Can't connect to existing server: {err}");

            let context = tauri::generate_context!();
            let library_path = tauri::api::path::data_dir()
                .expect("Cannot find data directory")
                .join(&context.config().tauri.bundle.identifier)
                .join("library");
            fs::create_dir_all(&library_path).expect("cannot create library folder");

            let db_pool = db::init_db(&library_path.join("metadata.db"));

            tauri::Builder::default()
                .plugin(DeeplinkPlugin::new(goto_annotation))
                .manage(Constants { library_path })
                .manage(db_pool)
                .invoke_handler(tauri::generate_handler![
                    library::upload_book,
                    library::get_books,
                    library::get_book,
                    library::delete_book,
                    library::add_annotation,
                    library::get_annotations_for_book,
                    library::get_annotation,
                    library::delete_annotation,
                ])
                .run(context)
                .expect("error while running tauri application");
        }
    }
}
