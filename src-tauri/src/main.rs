#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::{
    borrow::BorrowMut,
    fs,
    path::{Path, PathBuf},
};

use anyhow::Result;
use r2d2_sqlite::SqliteConnectionManager;
use rusqlite_migration::{Migrations, M};

mod commands;
mod error;

pub struct Constants {
    library_path: PathBuf,
}

fn init_db(db_path: &Path) -> Result<r2d2::Pool<SqliteConnectionManager>> {
    let sqlite_manager = SqliteConnectionManager::file(db_path);
    let sqlite_pool = r2d2::Pool::new(sqlite_manager)?;

    let migrations = Migrations::new(vec![M::up(include_str!("./migrations/init.sql"))]);
    migrations.to_latest(sqlite_pool.get()?.borrow_mut())?;

    Ok(sqlite_pool)
}

fn main() {
    let context = tauri::generate_context!();
    let library_path = tauri::api::path::data_dir()
        .expect("Cannot find data directory")
        .join(&context.config().tauri.bundle.identifier)
        .join("library");
    fs::create_dir_all(&library_path).expect("cannot create library folder");

    let db_pool =
        init_db(&library_path.join("metadata.db")).expect("database initialization error");

    tauri::Builder::default()
        .manage(Constants { library_path })
        .manage(db_pool)
        .invoke_handler(tauri::generate_handler![
            commands::db_execute,
            commands::db_execute_named,
            commands::db_query,
            commands::db_query_named,
            commands::upload_book
        ])
        .run(context)
        .expect("error while running tauri application");
}
