use diesel::prelude::*;
use tauri::State;

use crate::{
    db::{schema, SqlitePool},
    error::SerializableResult,
};

use super::data::BookAnnotation;

#[tauri::command]
pub fn add_annotation(
    db: State<SqlitePool>,
    book_id: String,
    cfi: String,
    text_content: String,
    color: i32,
) -> SerializableResult<BookAnnotation> {
    use schema::annotations::dsl;

    let mut conn = db.get()?;
    diesel::insert_into(dsl::annotations)
        .values((
            dsl::book_id.eq(&book_id),
            dsl::cfi.eq(&cfi),
            dsl::text_content.eq(&text_content),
            dsl::color.eq(color),
        ))
        .execute(&mut conn)?;

    Ok(BookAnnotation {
        book_id,
        cfi,
        text_content,
        color,
    })
}

#[tauri::command]
pub fn get_annotations_for_book(
    db: State<SqlitePool>,
    book_id: &str,
) -> SerializableResult<Vec<BookAnnotation>> {
    use schema::annotations::dsl;

    let mut conn = db.get()?;
    let rows = dsl::annotations
        .filter(dsl::book_id.eq(book_id))
        .load::<BookAnnotation>(&mut conn)?;

    Ok(rows)
}

#[tauri::command]
pub fn get_annotation(
    db: State<SqlitePool>,
    book_id: &str,
    cfi: &str,
) -> SerializableResult<BookAnnotation> {
    use schema::annotations::dsl;

    let mut conn = db.get()?;
    let annotation = dsl::annotations
        .filter(dsl::book_id.eq(book_id).and(dsl::cfi.eq(cfi)))
        .first(&mut conn)?;

    Ok(annotation)
}

#[tauri::command]
pub fn delete_annotation(
    db: State<SqlitePool>,
    book_id: String,
    cfi: String,
) -> SerializableResult<()> {
    use schema::annotations::dsl;

    let mut conn = db.get()?;
    diesel::delete(dsl::annotations.filter(dsl::book_id.eq(book_id).and(dsl::cfi.eq(cfi))))
        .execute(&mut conn)?;

    Ok(())
}
