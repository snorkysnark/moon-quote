#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::{borrow::BorrowMut, path::Path};

use anyhow::Result;
use r2d2_sqlite::SqliteConnectionManager;
use rusqlite_migration::{Migrations, M};

mod commands;
mod error;

fn init_db(db_path: &Path) -> Result<r2d2::Pool<SqliteConnectionManager>> {
    let sqlite_manager = SqliteConnectionManager::file(db_path);
    let sqlite_pool = r2d2::Pool::new(sqlite_manager)?;

    let migrations = Migrations::new(vec![M::up(include_str!("./migrations/init.sql"))]);
    migrations.to_latest(sqlite_pool.get()?.borrow_mut())?;

    Ok(sqlite_pool)
}

fn main() {
    let context = tauri::generate_context!();
    let db_path = tauri::api::path::data_dir()
        .map(|dir| {
            dir.join(&context.config().tauri.bundle.identifier)
                .join("library")
                .join("metadata.db")
        })
        .expect("Cannot find data directory");

    let db_pool = init_db(&db_path).expect("database initialization error");

    tauri::Builder::default()
        .manage(db_pool)
        .invoke_handler(tauri::generate_handler![
            commands::db_execute,
            commands::library_dir,
            commands::path_exists,
            commands::is_dir
        ])
        .run(context)
        .expect("error while running tauri application");
}
