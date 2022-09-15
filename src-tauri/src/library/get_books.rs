use std::path::Path;

use diesel::prelude::*;
use tauri::State;

use crate::{
    db::{schema, SqlitePool},
    error::SerializableResult,
    Constants,
};

use super::data::Book;

#[derive(Queryable)]
struct BookRow {
    book_id: i32,
    epub_file: String,
    cover_file: Option<String>,
    meta_title: Option<String>,
    meta_creator: Option<String>,
    meta_description: Option<String>,
    meta_pubdate: Option<String>,
    meta_publisher: Option<String>,
    meta_identifier: Option<String>,
    meta_language: Option<String>,
    meta_rights: Option<String>,
    meta_modified_date: Option<String>,
    meta_layout: Option<String>,
    meta_orientation: Option<String>,
    meta_flow: Option<String>,
    meta_viewport: Option<String>,
    meta_spread: Option<String>,
}

impl BookRow {
    fn with_absolute_paths<'a>(self, library_path: &Path) -> Book<'a> {
        let container_path = library_path.join(self.book_id.to_string());
        Book {
            book_id: self.book_id,
            epub_path: container_path.join(self.epub_file),
            cover_path: self
                .cover_file
                .map(|cover_file| container_path.join(cover_file)),
            meta_title: self.meta_title.map(Into::into),
            meta_creator: self.meta_creator.map(Into::into),
            meta_description: self.meta_description.map(Into::into),
            meta_pubdate: self.meta_pubdate.map(Into::into),
            meta_publisher: self.meta_publisher.map(Into::into),
            meta_identifier: self.meta_identifier.map(Into::into),
            meta_language: self.meta_language.map(Into::into),
            meta_rights: self.meta_rights.map(Into::into),
            meta_modified_date: self.meta_modified_date.map(Into::into),
            meta_layout: self.meta_layout.map(Into::into),
            meta_orientation: self.meta_orientation.map(Into::into),
            meta_flow: self.meta_flow.map(Into::into),
            meta_viewport: self.meta_viewport.map(Into::into),
            meta_spread: self.meta_spread.map(Into::into),
        }
    }
}

#[tauri::command]
pub fn get_books(
    db: State<SqlitePool>,
    constants: State<Constants>,
) -> SerializableResult<Vec<Book<'static>>> {
    use schema::books::dsl;

    let mut conn = db.get()?;
    let rows = dsl::books.load::<BookRow>(&mut conn)?;
    let rows_abs_path: Vec<_> = rows
        .into_iter()
        .map(|row| row.with_absolute_paths(&constants.library_path))
        .collect();

    Ok(rows_abs_path)
}

#[tauri::command]
pub fn get_book(
    db: State<SqlitePool>,
    constants: State<Constants>,
    book_id: i32,
) -> SerializableResult<Book<'static>> {
    use schema::books::dsl;

    let mut conn = db.get()?;
    let book: BookRow = dsl::books
        .filter(dsl::book_id.eq(book_id))
        .first(&mut conn)?;

    Ok(book.with_absolute_paths(&constants.library_path))
}
