use diesel::prelude::*;
use tauri::State;

use crate::{
    db::{schema, SqlitePool},
    error::{SerializableError, SerializableResult},
};

#[tauri::command]
pub fn add_annotation(
    db: State<SqlitePool>,
    book_id: i32,
    cfi: &str,
    text_content: &str,
) -> SerializableResult<()> {
    use schema::annotations::dsl;

    db.get()?.transaction::<_, SerializableError, _>(|conn| {
        diesel::insert_into(dsl::annotations)
            .values((
                dsl::book_id.eq(book_id),
                dsl::cfi.eq(cfi),
                dsl::text_content.eq(text_content),
            ))
            .execute(conn)?;

        Ok(())
    })
}
