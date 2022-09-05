use std::{fs, path::Path};

use diesel::prelude::*;
use serde::Deserialize;
use tauri::State;

use crate::{
    db::{schema, SqlitePool},
    error::{sanyhow, SerializableError, SerializableResult},
    Constants,
};

use super::data::{Book, EpubMetadata};

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

#[derive(Insertable)]
#[diesel(table_name = schema::books)]
struct NewBook<'a> {
    epub_file: &'a str,
    cover_file: Option<&'a str>,
    meta_title: Option<&'a str>,
    meta_creator: Option<&'a str>,
    meta_description: Option<&'a str>,
    meta_pubdate: Option<&'a str>,
    meta_publisher: Option<&'a str>,
    meta_identifier: Option<&'a str>,
    meta_language: Option<&'a str>,
    meta_rights: Option<&'a str>,
    meta_modified_date: Option<&'a str>,
    meta_layout: Option<&'a str>,
    meta_orientation: Option<&'a str>,
    meta_flow: Option<&'a str>,
    meta_viewport: Option<&'a str>,
    meta_spread: Option<&'a str>,
}

impl<'a> NewBook<'a> {
    fn from_parts(
        epub_file: &'a str,
        cover_file: Option<&'a str>,
        metadata: &EpubMetadata<'a>,
    ) -> Self {
        NewBook {
            epub_file,
            cover_file,
            meta_title: metadata.title,
            meta_creator: metadata.creator,
            meta_description: metadata.description,
            meta_pubdate: metadata.pubdate,
            meta_publisher: metadata.publisher,
            meta_identifier: metadata.identifier,
            meta_language: metadata.language,
            meta_rights: metadata.rights,
            meta_modified_date: metadata.modified_date,
            meta_layout: metadata.layout,
            meta_orientation: metadata.orientation,
            meta_flow: metadata.flow,
            meta_viewport: metadata.viewport,
            meta_spread: metadata.spread,
        }
    }
}

#[tauri::command]
pub fn upload_book<'a>(
    db: State<SqlitePool>,
    constants: State<Constants>,
    book_path: &Path,
    metadata: EpubMetadata<'a>,
    cover: Option<EpubCover>,
) -> SerializableResult<Book<'a>> {
    use schema::books::dsl::*;

    let mut conn = db.get()?;
    let book = conn.transaction::<_, SerializableError, _>(|conn| {
        let cover_file_desc = cover.map(|cover| cover.to_file_description()).transpose()?;
        let book_filename = book_path
            .file_name()
            .ok_or_else(|| sanyhow!("can't get epub filename"))?
            .to_str()
            .ok_or_else(|| sanyhow!("Book path has non-utf8 symbols"))?;

        let new_book_id: i32 = diesel::insert_into(books)
            .values(NewBook::from_parts(
                book_filename,
                cover_file_desc
                    .as_ref()
                    .map(|cover| cover.filename.as_str()),
                &metadata,
            ))
            .returning(book_id)
            .get_result(conn)?;

        let container_path = constants.library_path.join(new_book_id.to_string());
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

        Ok(Book::from_parts(
            new_book_id,
            new_book_path,
            new_cover_path,
            &metadata,
        ))
    })?;

    Ok(book)
}
