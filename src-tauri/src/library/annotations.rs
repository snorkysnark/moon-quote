use diesel::prelude::*;
use serde::{Serialize, Deserialize};
use tauri::State;

use crate::{
    db::{schema, SqlitePool},
    error::SerializableResult,
};

use super::data::{BookAnnotation, BookRow};

#[tauri::command]
pub fn add_annotation(db: State<SqlitePool>, annotation: BookAnnotation) -> SerializableResult<()> {
    use schema::annotations::dsl;

    let mut conn = db.get()?;
    diesel::insert_into(dsl::annotations)
        .values(annotation)
        .execute(&mut conn)?;

    Ok(())
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

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AnnotationFull {
    pub book_id: String,
    pub meta_title: Option<String>,
    pub meta_creator: Option<String>,
    pub cfi: String,
    pub text_content: String,
    pub color: String,
    pub comment: Option<String>,
    pub collapsed: bool,
}

impl From<(BookAnnotation, BookRow)> for AnnotationFull {
    fn from(values: (BookAnnotation, BookRow)) -> Self {
        Self {
            book_id: values.1.book_id,
            meta_title: values.1.meta_title,
            meta_creator: values.1.meta_creator,
            cfi: values.0.cfi,
            text_content: values.0.text_content,
            color: values.0.color,
            comment: values.0.comment,
            collapsed: values.0.collapsed,
        }
    }
}

#[tauri::command]
pub fn get_annotations_all(db: State<SqlitePool>) -> SerializableResult<Vec<AnnotationFull>> {
    use schema::annotations;
    use schema::books;

    let mut conn = db.get()?;
    let rows = annotations::table
        .inner_join(books::table)
        .load::<(BookAnnotation, BookRow)>(&mut conn)?
        .into_iter()
        .map(AnnotationFull::from)
        .collect();

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
