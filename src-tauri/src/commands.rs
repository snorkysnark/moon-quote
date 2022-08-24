use std::path::PathBuf;

use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;
use rusqlite::params_from_iter;
use serde_json::{Map as JsonMap, Value as JsonValue};
use tauri::{AppHandle, State};

use crate::error::SerializableResult;

type Db = Pool<SqliteConnectionManager>;

#[tauri::command]
pub fn db_execute(db: State<Db>, sql: &str, params: Vec<JsonValue>) -> SerializableResult<usize> {
    let num_rows = db
        .get()?
        .prepare_cached(sql)?
        .execute(params_from_iter(params.iter()))?;

    Ok(num_rows)
}

#[tauri::command]
pub fn db_query(
    db: State<Db>,
    sql: &str,
    params: Vec<JsonValue>,
) -> SerializableResult<Vec<JsonMap<String, JsonValue>>> {
    let conn = db.get()?;
    let mut statement = conn.prepare_cached(sql)?;
    let column_names: Vec<_> = statement
        .column_names()
        .into_iter()
        .map(String::from)
        .collect();

    let rows: Result<Vec<_>, _> = statement
        .query_map(params_from_iter(params.iter()), |row| {
            let mut named_row = JsonMap::new();

            for column_name in column_names.iter() {
                named_row.insert(
                    column_name.clone(),
                    row.get::<_, JsonValue>(column_name.as_str())?,
                );
            }
            Ok(named_row)
        })?
        .collect();

    Ok(rows?)
}

#[tauri::command]
pub fn library_dir(app_handle: AppHandle) -> Option<PathBuf> {
    tauri::api::path::data_dir().map(|dir| {
        dir.join(&app_handle.config().tauri.bundle.identifier)
            .join("library")
    })
}

#[tauri::command]
pub fn path_exists(path: PathBuf) -> bool {
    path.exists()
}

#[tauri::command]
pub fn is_dir(path: PathBuf) -> bool {
    path.is_dir()
}
