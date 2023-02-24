use diesel::prelude::*;
use tauri::{AppHandle, Manager, State};

use super::{
    data::{AnnotationFull, AnnotationFullRaw},
    Annotation,
};
use crate::{
    error::SerializableResult,
    library::{
        books::BookRaw,
        db::SqlitePool,
        schema::{annotations, books},
        LibraryPath,
    },
};

#[tauri::command]
pub fn get_annotations_all(app: AppHandle) -> SerializableResult<Vec<AnnotationFull>> {
    let db: State<SqlitePool> = app.state();
    let library_path: State<LibraryPath> = app.state();

    let mut conn = db.get()?;
    let rows = annotations::table
        .inner_join(books::table)
        .select((BookRaw::COLUMNS, Annotation::COLUMNS))
        .load::<AnnotationFullRaw>(&mut conn)?;
    let rows_abs_path: Vec<_> = rows
        .into_iter()
        .map(|row| AnnotationFull {
            book: row.book.with_absolute_paths_auto(&library_path.0),
            annotation: row.annotation,
        })
        .collect();

    Ok(rows_abs_path)
}
