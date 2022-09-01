use diesel::prelude::*;
use serde::Serialize;
use tauri::State;

use crate::{
    db::{schema, SqlitePool},
    error::{SerializableError, SerializableResult},
};

#[tauri::command]
pub fn add_annotation(
    db: State<SqlitePool>,
    book_id: i32,
    cfi: &str,
    text_content: &str,
) -> SerializableResult<()> {
    use schema::annotations::dsl;

    db.get()?.transaction::<_, SerializableError, _>(|conn| {
        diesel::insert_into(dsl::annotations)
            .values((
                dsl::book_id.eq(book_id),
                dsl::cfi.eq(cfi),
                dsl::text_content.eq(text_content),
            ))
            .execute(conn)?;

        Ok(())
    })
}

#[derive(Queryable, Serialize)]
pub struct BookAnnotation {
    annotation_id: i32,
    cfi: String,
    text_content: String,
}

#[tauri::command]
pub fn get_annotations_for_book(
    db: State<SqlitePool>,
    book_id: i32,
) -> SerializableResult<Vec<BookAnnotation>> {
    use schema::annotations::dsl;

    let mut conn = db.get()?;
    let rows = dsl::annotations
        .filter(dsl::book_id.eq(book_id))
        .select((dsl::annotation_id, dsl::cfi, dsl::text_content))
        .load::<BookAnnotation>(&mut conn)?;

    Ok(rows)
}
