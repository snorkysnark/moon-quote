#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::{fs, path::PathBuf};

mod commands;
mod db;
mod error;

pub struct Constants {
    library_path: PathBuf,
}

fn main() {
    let context = tauri::generate_context!();
    let library_path = tauri::api::path::data_dir()
        .expect("Cannot find data directory")
        .join(&context.config().tauri.bundle.identifier)
        .join("library");
    fs::create_dir_all(&library_path).expect("cannot create library folder");

    let db_pool = db::init_db(&library_path.join("metadata.db"));

    tauri::Builder::default()
        .manage(Constants { library_path })
        .manage(db_pool)
        .invoke_handler(tauri::generate_handler![commands::upload_book])
        .run(context)
        .expect("error while running tauri application");
}
