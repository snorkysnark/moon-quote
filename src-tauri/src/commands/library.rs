use std::{fs, path::Path};

use rusqlite::named_params;
use serde::Deserialize;
use tauri::State;

use crate::{
    error::{sanyhow, SerializableResult},
    Constants,
};

use super::Db;

#[derive(Deserialize)]
pub struct Metadata<'a> {
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

#[tauri::command]
pub fn upload_book(
    db: State<Db>,
    constants: State<Constants>,
    book_path: &Path,
    metadata: Metadata,
    cover_url: &Path,
    cover_data: &[u8],
) -> SerializableResult<i32> {
    let mut conn = db.get()?;
    let tx = conn.transaction()?;

    // Extract the extension from the cover url, creating a filename like "cover.<extension>"
    let cover_filename = format!(
        "cover.{}",
        cover_url
            .extension()
            .ok_or_else(|| sanyhow!("Cover url has no extension"))?
            .to_str()
            .ok_or_else(|| sanyhow!("Cover url has non-utf8 symbols"))?
    );

    let book_filename = book_path
        .file_name()
        .ok_or_else(|| sanyhow!("can't get epub filename"))?;

    let book_id: i32 = {
        let mut insert = tx.prepare_cached(include_str!("./sql/insert_book.sql"))?;

        {
            let book_path_str = book_filename
                .to_str()
                .ok_or_else(|| sanyhow!("Book path has non-utf8 symbols"))?;

            insert.query_row(
                named_params! {
                    ":epub_path": book_path_str,
                    ":cover_path": cover_filename,
                    ":meta_title": metadata.title,
                    ":meta_creator": metadata.creator,
                    ":meta_description": metadata.description,
                    ":meta_pubdate": metadata.pubdate,
                    ":meta_publisher": metadata.publisher,
                    ":meta_identifier": metadata.identifier,
                    ":meta_language": metadata.language,
                    ":meta_rights": metadata.rights,
                    ":meta_modified_date": metadata.modified_date,
                    ":meta_layout": metadata.layout,
                    ":meta_orientation": metadata.orientation,
                    ":meta_flow": metadata.flow,
                    ":meta_viewport": metadata.viewport,
                    ":meta_spread": metadata.spread,
                },
                |row| row.get(0),
            )?
        }
    };

    let container_path = constants.library_path.join(book_id.to_string());
    fs::create_dir(&container_path)?;
    fs::copy(book_path, container_path.join(book_filename))?;

    fs::write(container_path.join(cover_filename), &cover_data)?;

    tx.commit()?;
    Ok(book_id)
}
