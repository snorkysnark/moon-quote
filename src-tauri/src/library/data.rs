use std::path::PathBuf;

use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct EpubMetadata<'a> {
    pub title: Option<&'a str>,
    pub creator: Option<&'a str>,
    pub description: Option<&'a str>,
    pub pubdate: Option<&'a str>,
    pub publisher: Option<&'a str>,
    pub identifier: Option<&'a str>,
    pub language: Option<&'a str>,
    pub rights: Option<&'a str>,
    pub modified_date: Option<&'a str>,
    pub layout: Option<&'a str>,
    pub orientation: Option<&'a str>,
    pub flow: Option<&'a str>,
    pub viewport: Option<&'a str>,
    pub spread: Option<&'a str>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Book<'a> {
    book_id: i32,
    epub_path: PathBuf,
    cover_path: Option<PathBuf>,
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

impl<'a> Book<'a> {
    pub fn from_parts(
        book_id: i32,
        epub_path: PathBuf,
        cover_path: Option<PathBuf>,
        metadata: &EpubMetadata<'a>,
    ) -> Self {
        Book {
            book_id,
            epub_path,
            cover_path,
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
