use std::path::PathBuf;

use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;
use rusqlite::params_from_iter;
use serde_json::Value as JsonValue;
use tauri::{AppHandle, State};

use crate::error::SerializableResult;

type Db = Pool<SqliteConnectionManager>;

#[tauri::command]
pub fn query(db: State<Db>, sql: &str, params: Vec<JsonValue>) -> SerializableResult<()> {
    db.get()?.execute(sql, params_from_iter(params.iter()))?;

    Ok(())
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
