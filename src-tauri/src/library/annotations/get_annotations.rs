use diesel::prelude::*;
use tauri::{AppHandle, Manager, State};

use super::data::Annotation;
use crate::{
    error::SerializableResult,
    library::{db::SqlitePool, schema},
};

#[tauri::command]
pub fn get_annotations_for_book(
    app: AppHandle,
    book_id: &str,
) -> SerializableResult<Vec<Annotation>> {
    let db: State<SqlitePool> = app.state();

    use schema::annotations::dsl;

    let mut conn = db.get()?;
    let rows = dsl::annotations
        .filter(dsl::book_id.eq(book_id))
        .load::<Annotation>(&mut conn)?;

    Ok(rows)
}

#[tauri::command]
pub fn get_annotation(app: AppHandle, annotation_id: i32) -> SerializableResult<Annotation> {
    let db: State<SqlitePool> = app.state();

    use schema::annotations::dsl;

    let mut conn = db.get()?;
    let annotation = dsl::annotations
        .filter(dsl::annotation_id.eq(annotation_id))
        .first(&mut conn)?;

    Ok(annotation)
}
