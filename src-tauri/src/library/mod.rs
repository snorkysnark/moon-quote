mod annotations;
mod books;
mod db;
mod schema;

use std::{fs, path::PathBuf};

use anyhow::Context;
use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Wry,
};

pub use annotations::{get_annotation, get_annotations_all, Annotation, AnnotationFull};
pub use books::{get_book, Book};

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
            books::get_books,
            books::delete_book,
            books::upload_book,
            annotations::get_annotations_for_book,
            annotations::get_annotation,
            annotations::delete_annotation,
            annotations::add_annotation,
            annotations::get_annotations_all,
        ])
        .build()
}
