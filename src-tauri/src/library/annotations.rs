use std::borrow::Cow;

use diesel::prelude::*;
use serde::Serialize;
use tauri::State;

use crate::{
    db::{schema, SqlitePool},
    error::SerializableResult,
};

#[derive(Clone, Queryable, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BookAnnotation<'a> {
    annotation_id: i32,
    book_id: i32,
    cfi: Cow<'a, str>,
    text_content: Cow<'a, str>,
    color: i32,
}

#[tauri::command]
pub fn add_annotation<'a>(
    db: State<SqlitePool>,
    book_id: i32,
    cfi: &'a str,
    text_content: &'a str,
    color: i32,
) -> SerializableResult<BookAnnotation<'a>> {
    use schema::annotations::dsl;

    let mut conn = db.get()?;
    let annotation_id: i32 = diesel::insert_into(dsl::annotations)
        .values((
            dsl::book_id.eq(book_id),
            dsl::cfi.eq(cfi),
            dsl::text_content.eq(text_content),
            dsl::color.eq(color),
        ))
        .returning(dsl::annotation_id)
        .get_result(&mut conn)?;

    Ok(BookAnnotation {
        book_id,
        annotation_id,
        cfi: cfi.into(),
        text_content: text_content.into(),
        color,
    })
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
        .load::<BookAnnotation>(&mut conn)?;

    Ok(rows)
}

#[tauri::command]
pub fn get_annotation<'a>(
    db: State<SqlitePool>,
    annotation_id: i32,
) -> SerializableResult<BookAnnotation<'a>> {
    use schema::annotations::dsl;

    let mut conn = db.get()?;
    let annotation = dsl::annotations
        .filter(dsl::annotation_id.eq(annotation_id))
        .first(&mut conn)?;

    Ok(annotation)
}

#[tauri::command]
pub fn delete_annotation(db: State<SqlitePool>, annotation_id: i32) -> SerializableResult<()> {
    use schema::annotations::dsl;

    let mut conn = db.get()?;
    diesel::delete(dsl::annotations.filter(dsl::annotation_id.eq(annotation_id)))
        .execute(&mut conn)?;

    Ok(())
}
