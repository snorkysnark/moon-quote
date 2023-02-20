use std::fs;

use diesel::prelude::*;
use tauri::{AppHandle, Manager, State};

use crate::{
    error::{SerializableError, SerializableResult},
    library::{db::SqlitePool, schema, LibraryPath},
};

#[tauri::command]
pub fn delete_book(app: AppHandle, book_id: &str) -> SerializableResult<()> {
    let db: State<SqlitePool> = app.state();
    let library_path: State<LibraryPath> = app.state();

    use schema::books::dsl;

    db.get()?.transaction::<(), SerializableError, _>(|conn| {
        diesel::delete(dsl::books.filter(dsl::book_id.eq(&book_id))).execute(conn)?;
        fs::remove_dir_all(library_path.0.join(book_id.to_string()))?;

        Ok(())
    })
}
