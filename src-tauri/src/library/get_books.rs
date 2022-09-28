use diesel::prelude::*;
use tauri::State;

use crate::{
    db::{schema, SqlitePool},
    error::SerializableResult,
    Constants,
};

use super::{data::BookRow, Book};

#[tauri::command]
pub fn get_books(
    db: State<SqlitePool>,
    constants: State<Constants>,
) -> SerializableResult<Vec<Book>> {
    use schema::books::dsl;

    let mut conn = db.get()?;
    let rows = dsl::books.load::<BookRow>(&mut conn)?;
    let rows_abs_path: Vec<_> = rows
        .into_iter()
        .map(|row| row.with_absolute_paths_auto(&constants.library_path))
        .collect();

    Ok(rows_abs_path)
}

#[tauri::command]
pub fn get_book(
    db: State<SqlitePool>,
    constants: State<Constants>,
    book_id: &str,
) -> SerializableResult<Book> {
    use schema::books::dsl;

    let mut conn = db.get()?;
    let book: BookRow = dsl::books
        .filter(dsl::book_id.eq(book_id))
        .first(&mut conn)?;

    Ok(book.with_absolute_paths_auto(&constants.library_path))
}
