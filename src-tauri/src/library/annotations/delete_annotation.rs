use diesel::prelude::*;
use tauri::{AppHandle, Manager, State};

use crate::{
    error::SerializableResult,
    library::{db::SqlitePool, schema},
};

#[tauri::command]
pub fn delete_annotation(app: AppHandle, annotation_id: i32) -> SerializableResult<()> {
    let db: State<SqlitePool> = app.state();

    use schema::annotations::dsl;

    let mut conn = db.get()?;
    diesel::delete(dsl::annotations.filter(dsl::annotation_id.eq(annotation_id)))
        .execute(&mut conn)?;

    Ok(())
}
