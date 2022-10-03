use std::{fs, path::PathBuf};

use diesel::prelude::*;
use serde::Deserialize;
use tauri::State;

use crate::{
    db::{schema, SqlitePool},
    error::{sanyhow, SerializableError, SerializableResult},
    Constants,
};

use super::data::{Book, BookRow, EpubMetadata};

#[derive(Deserialize)]
pub struct EpubCover {
    url: String,
    data: Vec<u8>,
}

struct EpubCoverFile {
    filename: String,
    data: Vec<u8>,
}

impl EpubCover {
    fn to_file_description(self) -> SerializableResult<EpubCoverFile> {
        let (_, extension) = self
            .url
            .rsplit_once(".")
            .ok_or_else(|| sanyhow!("Cover url has no extension"))?;

        Ok(EpubCoverFile {
            filename: format!("cover.{extension}"),
            data: self.data,
        })
    }
}

#[tauri::command]
pub fn upload_book<'a>(
    db: State<SqlitePool>,
    constants: State<Constants>,
    book_path: PathBuf,
    metadata: EpubMetadata,
    cover: Option<EpubCover>,
) -> SerializableResult<Book> {
    use schema::books::dsl;

    let mut conn = db.get()?;
    let book = conn.transaction::<_, SerializableError, _>(|conn| {
        let cover_file_desc = cover.map(|cover| cover.to_file_description()).transpose()?;
        let book_filename = book_path
            .file_name()
            .ok_or_else(|| sanyhow!("can't get epub filename"))?
            .to_str()
            .ok_or_else(|| sanyhow!("Book path has non-utf8 symbols"))?
            .to_string();

        let book_id = sha256::digest_file(&book_path)?;
        let book_row = BookRow::from_parts(
            book_id.clone(),
            book_filename.clone(),
            cover_file_desc.as_ref().map(|cover| cover.filename.clone()),
            metadata,
        );
        diesel::insert_into(dsl::books)
            .values(&book_row)
            .execute(conn)?;

        let container_path = constants.library_path.join(book_id);
        let new_book_path = container_path.join(book_filename);

        fs::create_dir(&container_path)?;
        fs::copy(&book_path, &new_book_path)?;

        let new_cover_path = match cover_file_desc {
            Some(cover_file_desc) => {
                let new_cover_path = container_path.join(cover_file_desc.filename);
                fs::write(&new_cover_path, &cover_file_desc.data)?;
                Some(new_cover_path)
            }
            None => None,
        };

        Ok(book_row.with_absolute_paths(new_book_path, new_cover_path))
    })?;

    Ok(book)
}
