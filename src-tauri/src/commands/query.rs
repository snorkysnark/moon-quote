use serde_json::{Map as JsonMap, Value as JsonValue};
use tauri::State;

use super::Db;
use crate::error::SerializableResult;

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
