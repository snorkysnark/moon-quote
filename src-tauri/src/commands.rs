use std::{fs, path::Path};

use diesel::{Connection, Insertable, RunQueryDsl};
use serde::Deserialize;
use tauri::State;

use crate::{
    db::{schema::books, SqlitePool},
    error::{sanyhow, SerializableError, SerializableResult},
    Constants,
};

#[derive(Deserialize)]
pub struct EpubMetadata<'a> {
    title: Option<&'a str>,
    creator: Option<&'a str>,
    description: Option<&'a str>,
    pubdate: Option<&'a str>,
    publisher: Option<&'a str>,
    identifier: Option<&'a str>,
    language: Option<&'a str>,
    rights: Option<&'a str>,
    modified_date: Option<&'a str>,
    layout: Option<&'a str>,
    orientation: Option<&'a str>,
    flow: Option<&'a str>,
    viewport: Option<&'a str>,
    spread: Option<&'a str>,
}

#[derive(Deserialize)]
pub struct EpubCover<'a> {
    url: &'a Path,
    data: &'a [u8],
}

struct EpubCoverFile<'a> {
    filename: String,
    data: &'a [u8],
}

impl<'a> EpubCover<'a> {
    fn to_file_description(self) -> SerializableResult<EpubCoverFile<'a>> {
        let extension = self
            .url
            .extension()
            .ok_or_else(|| sanyhow!("Cover url has no extension"))?
            .to_str()
            .ok_or_else(|| sanyhow!("Cover url has non-utf8 symbols"))?;

        Ok(EpubCoverFile {
            filename: format!("cover.{extension}"),
            data: self.data,
        })
    }
}

#[derive(Insertable)]
#[diesel(table_name = books)]
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
    fn from_metadata(
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
pub fn upload_book(
    db: State<SqlitePool>,
    constants: State<Constants>,
    book_path: &Path,
    metadata: EpubMetadata,
    cover: Option<EpubCover>,
) -> SerializableResult<i32> {
    let mut conn = db.get()?;
    let book_id = conn.transaction::<i32, SerializableError, _>(|conn| {
        let cover_file = cover.map(|cover| cover.to_file_description()).transpose()?;
        let book_filename = book_path
            .file_name()
            .ok_or_else(|| sanyhow!("can't get epub filename"))?
            .to_str()
            .ok_or_else(|| sanyhow!("Book path has non-utf8 symbols"))?;

        let book_id: i32 = diesel::insert_into(books::table)
            .values(NewBook::from_metadata(
                book_filename,
                cover_file.as_ref().map(|cover| cover.filename.as_str()),
                &metadata,
            ))
            .returning(books::book_id)
            .get_result(conn)?;

        let container_path = constants.library_path.join(book_id.to_string());
        fs::create_dir(&container_path)?;
        fs::copy(book_path, container_path.join(book_filename))?;

        if let Some(cover_file) = cover_file {
            fs::write(container_path.join(cover_file.filename), &cover_file.data)?;
        }

        Ok(book_id)
    })?;

    Ok(book_id)
}
