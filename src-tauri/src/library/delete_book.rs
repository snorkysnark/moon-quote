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
    id_to_delete: i32,
) -> SerializableResult<()> {
    use schema::books::dsl::*;

    db.get()?.transaction::<(), SerializableError, _>(|conn| {
        diesel::delete(books.filter(book_id.eq(id_to_delete))).execute(conn)?;
        fs::remove_dir_all(constants.library_path.join(id_to_delete.to_string()))?;

        Ok(())
    })
}
