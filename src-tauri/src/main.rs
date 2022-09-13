#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::{fs, path::PathBuf};

use deeplink::GoToAnnotation;

mod db;
mod deeplink;
mod error;
mod library;

pub struct Constants {
    library_path: PathBuf,
    // Can't emit goto_annotation event while the frontend is not initialized,
    // keeping the initial argument for later
    initial_annotation_link: Option<GoToAnnotation>,
}

fn main() {
    let initial_annotation_link = std::env::args()
        .nth(1)
        .map(|url| GoToAnnotation::from_url_string(&url).expect("Failed to parse url"));

    let context = tauri::generate_context!();
    let library_path = tauri::api::path::data_dir()
        .expect("Cannot find data directory")
        .join(&context.config().tauri.bundle.identifier)
        .join("library");
    fs::create_dir_all(&library_path).expect("cannot create library folder");

    let db_pool = db::init_db(&library_path.join("metadata.db"));

    tauri::Builder::default()
        .manage(Constants {
            library_path,
            initial_annotation_link,
        })
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
            deeplink::initial_annotation_link
        ])
        .run(context)
        .expect("error while running tauri application");
}
