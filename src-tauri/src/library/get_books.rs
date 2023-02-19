use std::path::{Path, PathBuf};

use diesel::prelude::*;
use serde::Serialize;
use tauri::{AppHandle, Manager, State};

use super::{db::SqlitePool, schema, LibraryPath};
use crate::error::SerializableResult;

#[derive(Debug, Queryable)]
struct BookRow {
    pub book_id: String,
    pub epub_file: String,
    pub cover_file: Option<String>,
    pub meta_title: Option<String>,
    pub meta_creator: Option<String>,
    pub meta_description: Option<String>,
    pub meta_pubdate: Option<String>,
    pub meta_publisher: Option<String>,
    pub meta_identifier: Option<String>,
    pub meta_language: Option<String>,
    pub meta_rights: Option<String>,
    pub meta_modified_date: Option<String>,
    pub meta_layout: Option<String>,
    pub meta_orientation: Option<String>,
    pub meta_flow: Option<String>,
    pub meta_viewport: Option<String>,
    pub meta_spread: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Book {
    pub book_id: String,
    pub epub_path: PathBuf,
    pub cover_path: Option<PathBuf>,
    pub meta_title: Option<String>,
    pub meta_creator: Option<String>,
    pub meta_description: Option<String>,
    pub meta_pubdate: Option<String>,
    pub meta_publisher: Option<String>,
    pub meta_identifier: Option<String>,
    pub meta_language: Option<String>,
    pub meta_rights: Option<String>,
    pub meta_modified_date: Option<String>,
    pub meta_layout: Option<String>,
    pub meta_orientation: Option<String>,
    pub meta_flow: Option<String>,
    pub meta_viewport: Option<String>,
    pub meta_spread: Option<String>,
}

impl BookRow {
    fn with_absolute_paths(self, library_path: &Path) -> Book {
        let container_path = library_path.join(&self.book_id);
        let epub_path = container_path.join(&self.epub_file);
        let cover_path = self
            .cover_file
            .as_ref()
            .map(|cover_file| container_path.join(cover_file));

        Book {
            book_id: self.book_id,
            epub_path,
            cover_path,
            meta_title: self.meta_title,
            meta_creator: self.meta_creator,
            meta_description: self.meta_description,
            meta_pubdate: self.meta_pubdate,
            meta_publisher: self.meta_publisher,
            meta_identifier: self.meta_identifier,
            meta_language: self.meta_language,
            meta_rights: self.meta_rights,
            meta_modified_date: self.meta_modified_date,
            meta_layout: self.meta_layout,
            meta_orientation: self.meta_orientation,
            meta_flow: self.meta_flow,
            meta_viewport: self.meta_viewport,
            meta_spread: self.meta_spread,
        }
    }
}

#[tauri::command]
pub fn get_books(app: AppHandle) -> SerializableResult<Vec<Book>> {
    let db: State<SqlitePool> = app.state();
    let library_path: State<LibraryPath> = app.state();

    use schema::books::dsl;

    let mut conn = db.get()?;
    let rows = dsl::books.load::<BookRow>(&mut conn)?;
    let rows_abs_path: Vec<_> = rows
        .into_iter()
        .map(|row| row.with_absolute_paths(&library_path.0))
        .collect();

    Ok(rows_abs_path)
}

#[tauri::command]
pub fn get_book(app: AppHandle, book_id: &str) -> SerializableResult<Book> {
    let db: State<SqlitePool> = app.state();
    let library_path: State<LibraryPath> = app.state();

    use schema::books::dsl;

    let mut conn = db.get()?;
    let book: BookRow = dsl::books
        .filter(dsl::book_id.eq(book_id))
        .first(&mut conn)?;

    Ok(book.with_absolute_paths(&library_path.0))
}
