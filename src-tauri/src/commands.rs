use std::path::PathBuf;

use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;
use serde_json::{Map as JsonMap, Value as JsonValue};
use tauri::{AppHandle, State};

use crate::error::SerializableResult;

type Db = Pool<SqliteConnectionManager>;

#[tauri::command]
pub fn db_execute(db: State<Db>, sql: &str, params: Vec<JsonValue>) -> SerializableResult<usize> {
    let num_rows = db
        .get()?
        .prepare_cached(sql)?
        .execute(serde_rusqlite::to_params(params)?)?;

    Ok(num_rows)
}

#[tauri::command]
pub fn db_execute_named(
    db: State<Db>,
    sql: &str,
    params: JsonMap<String, JsonValue>,
) -> SerializableResult<usize> {
    let params_named = serde_rusqlite::to_params_named(params)?;

    let num_rows = db
        .get()?
        .prepare_cached(sql)?
        .execute(params_named.to_slice().as_slice())?;

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

    let rows: Result<Vec<_>, _> =
        serde_rusqlite::from_rows(statement.query(serde_rusqlite::to_params(params)?)?).collect();

    Ok(rows?)
}

#[tauri::command]
pub fn db_query_named(
    db: State<Db>,
    sql: &str,
    params: JsonMap<String, JsonValue>,
) -> SerializableResult<Vec<JsonMap<String, JsonValue>>> {
    let conn = db.get()?;
    let mut statement = conn.prepare_cached(sql)?;
    let params_named = serde_rusqlite::to_params_named(params)?;

    let rows: Result<Vec<_>, _> =
        serde_rusqlite::from_rows(statement.query(params_named.to_slice().as_slice())?).collect();

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
