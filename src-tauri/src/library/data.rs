use std::{borrow::Cow, path::PathBuf};

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

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Book<'a> {
    pub book_id: i32,
    pub epub_path: PathBuf,
    pub cover_path: Option<PathBuf>,
    pub meta_title: Option<Cow<'a, str>>,
    pub meta_creator: Option<Cow<'a, str>>,
    pub meta_description: Option<Cow<'a, str>>,
    pub meta_pubdate: Option<Cow<'a, str>>,
    pub meta_publisher: Option<Cow<'a, str>>,
    pub meta_identifier: Option<Cow<'a, str>>,
    pub meta_language: Option<Cow<'a, str>>,
    pub meta_rights: Option<Cow<'a, str>>,
    pub meta_modified_date: Option<Cow<'a, str>>,
    pub meta_layout: Option<Cow<'a, str>>,
    pub meta_orientation: Option<Cow<'a, str>>,
    pub meta_flow: Option<Cow<'a, str>>,
    pub meta_viewport: Option<Cow<'a, str>>,
    pub meta_spread: Option<Cow<'a, str>>,
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
            meta_title: metadata.title.map(Into::into),
            meta_creator: metadata.creator.map(Into::into),
            meta_description: metadata.description.map(Into::into),
            meta_pubdate: metadata.pubdate.map(Into::into),
            meta_publisher: metadata.publisher.map(Into::into),
            meta_identifier: metadata.identifier.map(Into::into),
            meta_language: metadata.language.map(Into::into),
            meta_rights: metadata.rights.map(Into::into),
            meta_modified_date: metadata.modified_date.map(Into::into),
            meta_layout: metadata.layout.map(Into::into),
            meta_orientation: metadata.orientation.map(Into::into),
            meta_flow: metadata.flow.map(Into::into),
            meta_viewport: metadata.viewport.map(Into::into),
            meta_spread: metadata.spread.map(Into::into),
        }
    }
}
