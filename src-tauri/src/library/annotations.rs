use diesel::prelude::*;
use serde::Serialize;
use tauri::State;

use crate::{
    db::{schema, SqlitePool},
    error::SerializableResult,
};

#[tauri::command]
pub fn add_annotation(
    db: State<SqlitePool>,
    book_id: i32,
    cfi: &str,
    text_content: &str,
) -> SerializableResult<i32> {
    use schema::annotations::dsl;

    let mut conn = db.get()?;
    let annotation_id: i32 = diesel::insert_into(dsl::annotations)
        .values((
            dsl::book_id.eq(book_id),
            dsl::cfi.eq(cfi),
            dsl::text_content.eq(text_content),
        ))
        .returning(dsl::annotation_id)
        .get_result(&mut conn)?;

    Ok(annotation_id)
}

#[derive(Queryable, Serialize)]
#[serde(rename_all = "camelCase")]
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

#[tauri::command]
pub fn delete_annotation(db: State<SqlitePool>, annotation_id: i32) -> SerializableResult<()> {
    use schema::annotations::dsl;

    let mut conn = db.get()?;
    diesel::delete(dsl::annotations.filter(dsl::annotation_id.eq(annotation_id)))
        .execute(&mut conn)?;

    Ok(())
}
