mod db;
mod delete_book;
mod get_books;
mod schema;
mod upload_book;

use std::{fs, path::PathBuf};

use anyhow::Context;
use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Wry,
};

struct LibraryPath(PathBuf);

pub fn plugin() -> TauriPlugin<Wry> {
    Builder::new("library")
        .setup(|app_handle| {
            let library_path = tauri::api::path::data_dir()
                .context("Cannot find data directory")?
                .join(&app_handle.config().tauri.bundle.identifier)
                .join("library");
            fs::create_dir_all(&library_path).context("creating library folder")?;

            app_handle.manage(db::init_database(&library_path.join("metadata.db"))?);
            app_handle.manage(LibraryPath(library_path));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_books::get_books,
            delete_book::delete_book
        ])
        .build()
}
