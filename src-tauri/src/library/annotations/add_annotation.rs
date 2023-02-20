use diesel::prelude::*;
use tauri::{AppHandle, Manager, State};

use super::data::{Annotation, AnnotationData};
use crate::{
    error::SerializableResult,
    library::{db::SqlitePool, schema},
};

#[tauri::command]
pub fn add_annotation(app: AppHandle, data: AnnotationData) -> SerializableResult<Annotation> {
    let db: State<SqlitePool> = app.state();
    use schema::annotations::dsl;

    let mut conn = db.get()?;
    let annotation_id = diesel::insert_into(dsl::annotations)
        .values(&data)
        .returning(dsl::annotation_id)
        .get_result(&mut conn)?;

    Ok(Annotation {
        annotation_id,
        data,
    })
}
