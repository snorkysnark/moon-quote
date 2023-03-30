use diesel::prelude::*;
use tauri::{AppHandle, Manager, State};

use crate::{
    error::SerializableResult,
    library::{db::SqlitePool, schema},
};

#[tauri::command]
pub fn set_annotation_comment(
    app: AppHandle,
    annotation_id: i32,
    value: Option<String>,
) -> SerializableResult<()> {
    let db: State<SqlitePool> = app.state();

    use schema::annotations::dsl;

    let mut conn = db.get()?;
    diesel::update(dsl::annotations)
        .filter(dsl::annotation_id.eq(annotation_id))
        .set(dsl::comment.eq(value))
        .execute(&mut conn)?;

    Ok(())
}
