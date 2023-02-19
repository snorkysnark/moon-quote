use std::{path::PathBuf, fs};

use diesel::prelude::*;
use serde::Deserialize;
use tauri::{AppHandle, Manager, State};

use super::{db::SqlitePool, schema, LibraryPath};
use crate::error::{SerializableResult, SerializableError, sanyhow};

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

#[derive(Deserialize, Insertable)]
#[diesel(table_name = schema::books)]
pub(super) struct EpubMetadata {
    #[diesel(column_name = "meta_title")]
    pub title: Option<String>,
    #[diesel(column_name = "meta_creator")]
    pub creator: Option<String>,
    #[diesel(column_name = "meta_description")]
    pub description: Option<String>,
    #[diesel(column_name = "meta_pubdate")]
    pub pubdate: Option<String>,
    #[diesel(column_name = "meta_publisher")]
    pub publisher: Option<String>,
    #[diesel(column_name = "meta_identifier")]
    pub identifier: Option<String>,
    #[diesel(column_name = "meta_language")]
    pub language: Option<String>,
    #[diesel(column_name = "meta_rights")]
    pub rights: Option<String>,
    #[diesel(column_name = "meta_modified_date")]
    pub modified_date: Option<String>,
    #[diesel(column_name = "meta_layout")]
    pub layout: Option<String>,
    #[diesel(column_name = "meta_orientation")]
    pub orientation: Option<String>,
    #[diesel(column_name = "meta_flow")]
    pub flow: Option<String>,
    #[diesel(column_name = "meta_viewport")]
    pub viewport: Option<String>,
    #[diesel(column_name = "meta_spread")]
    pub spread: Option<String>,
}

#[derive(Insertable)]
#[diesel(table_name = schema::books)]
pub struct BookRow {
    pub book_id: String,
    pub epub_file: String,
    pub cover_file: Option<String>,
    #[diesel(embed)]
    pub metadata: EpubMetadata,
}

#[tauri::command]
pub fn upload_book(
    app: AppHandle,
    book_path: PathBuf,
    metadata: EpubMetadata,
    cover: Option<EpubCover>,
) -> SerializableResult<Book> {
    let db: State<SqlitePool> = app.state();
    let library_path: State<LibraryPath> = app.state();

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
        let book_row = BookRow {
            book_id: book_id.clone(),
            epub_file: book_filename.clone(),
            cover_file: cover_file_desc.map(|cover| cover.filename.clone()),
            metadata
        };
        // let book_row = BookRow::from_parts(
        //     book_id.clone(),
        //     book_filename.clone(),
        //     cover_file_desc.as_ref().map(|cover| cover.filename.clone()),
        //     metadata,
        // );
        diesel::insert_into(dsl::books)
            .values(&book_row)
            .execute(conn)?;

        let container_path = library_path.0.join(book_id);
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
