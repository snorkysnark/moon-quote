use diesel::prelude::*;
use tauri::{AppHandle, Manager, State};

use super::data::{BookAbsolutePath, BookRaw};
use crate::{
    error::SerializableResult,
    library::{db::SqlitePool, schema::books::dsl, LibraryPath},
};

const ALL_COLUMNS: (
    dsl::book_id,
    dsl::epub_file,
    dsl::cover_file,
    (
        dsl::meta_title,
        dsl::meta_creator,
        dsl::meta_description,
        dsl::meta_pubdate,
        dsl::meta_publisher,
        dsl::meta_identifier,
        dsl::meta_language,
        dsl::meta_rights,
        dsl::meta_modified_date,
        dsl::meta_layout,
        dsl::meta_orientation,
        dsl::meta_flow,
        dsl::meta_viewport,
        dsl::meta_spread,
    ),
) = (
    dsl::book_id,
    dsl::epub_file,
    dsl::cover_file,
    (
        dsl::meta_title,
        dsl::meta_creator,
        dsl::meta_description,
        dsl::meta_pubdate,
        dsl::meta_publisher,
        dsl::meta_identifier,
        dsl::meta_language,
        dsl::meta_rights,
        dsl::meta_modified_date,
        dsl::meta_layout,
        dsl::meta_orientation,
        dsl::meta_flow,
        dsl::meta_viewport,
        dsl::meta_spread,
    ),
);

#[tauri::command]
pub fn get_books(app: AppHandle) -> SerializableResult<Vec<BookAbsolutePath>> {
    let db: State<SqlitePool> = app.state();
    let library_path: State<LibraryPath> = app.state();

    let mut conn = db.get()?;
    let rows = dsl::books.select(ALL_COLUMNS).load::<BookRaw>(&mut conn)?;
    let rows_abs_path: Vec<_> = rows
        .into_iter()
        .map(|row| row.with_absolute_paths_auto(&library_path.0))
        .collect();

    Ok(rows_abs_path)
}

#[tauri::command]
pub fn get_book(app: AppHandle, book_id: &str) -> SerializableResult<BookAbsolutePath> {
    let db: State<SqlitePool> = app.state();
    let library_path: State<LibraryPath> = app.state();

    let mut conn = db.get()?;
    let book: BookRaw = dsl::books
        .select(ALL_COLUMNS)
        .filter(dsl::book_id.eq(book_id))
        .first(&mut conn)?;

    Ok(book.with_absolute_paths_auto(&library_path.0))
}
