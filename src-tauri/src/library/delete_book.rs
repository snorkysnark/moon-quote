use std::fs;

use diesel::prelude::*;
use tauri::State;

use crate::{
    db::{schema, SqlitePool},
    error::{SerializableError, SerializableResult},
    Constants,
};

#[tauri::command]
pub fn delete_book(
    db: State<SqlitePool>,
    constants: State<Constants>,
    book_id: &str,
) -> SerializableResult<()> {
    use schema::books::dsl;

    db.get()?.transaction::<(), SerializableError, _>(|conn| {
        diesel::delete(dsl::books.filter(dsl::book_id.eq(&book_id))).execute(conn)?;
        fs::remove_dir_all(constants.library_path.join(book_id.to_string()))?;

        Ok(())
    })
}
