use std::path::{Path, PathBuf};

use diesel::{Insertable, Queryable};
use serde::{Deserialize, Serialize};

use crate::library::schema;

#[derive(Debug, Deserialize)]
pub struct EpubMetadata {
    pub title: Option<String>,
    pub creator: Option<String>,
    pub description: Option<String>,
    pub pubdate: Option<String>,
    pub publisher: Option<String>,
    pub identifier: Option<String>,
    pub language: Option<String>,
    pub rights: Option<String>,
    pub modified_date: Option<String>,
    pub layout: Option<String>,
    pub orientation: Option<String>,
    pub flow: Option<String>,
    pub viewport: Option<String>,
    pub spread: Option<String>,
}

// Represents a full row in the 'books' table of the database
#[derive(Debug, Queryable, Insertable)]
#[diesel(table_name = schema::books)]
pub struct BookRaw {
    pub book_id: String,
    pub epub_file: String,
    pub cover_file: Option<String>,
    pub meta_title: Option<String>,
    pub meta_creator: Option<String>,
    pub meta_description: Option<String>,
    pub meta_pubdate: Option<String>,
    pub meta_publisher: Option<String>,
    pub meta_identifier: Option<String>,
    pub meta_language: Option<String>,
    pub meta_rights: Option<String>,
    pub meta_modified_date: Option<String>,
    pub meta_layout: Option<String>,
    pub meta_orientation: Option<String>,
    pub meta_flow: Option<String>,
    pub meta_viewport: Option<String>,
    pub meta_spread: Option<String>,
}

// Same as BookRaw, but with the relative paths replaced with absolute ones
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BookAbsolutePath {
    pub book_id: String,
    pub epub_path: PathBuf,
    pub cover_path: Option<PathBuf>,
    pub meta_title: Option<String>,
    pub meta_creator: Option<String>,
    pub meta_description: Option<String>,
    pub meta_pubdate: Option<String>,
    pub meta_publisher: Option<String>,
    pub meta_identifier: Option<String>,
    pub meta_language: Option<String>,
    pub meta_rights: Option<String>,
    pub meta_modified_date: Option<String>,
    pub meta_layout: Option<String>,
    pub meta_orientation: Option<String>,
    pub meta_flow: Option<String>,
    pub meta_viewport: Option<String>,
    pub meta_spread: Option<String>,
}

impl BookRaw {
    pub fn from_metadata(
        book_id: String,
        epub_file: String,
        cover_file: Option<String>,
        metadata: EpubMetadata,
    ) -> Self {
        BookRaw {
            book_id,
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

    pub fn with_absolute_paths(self, epub_path: PathBuf, cover_path: Option<PathBuf>) -> BookAbsolutePath {
        BookAbsolutePath {
            book_id: self.book_id,
            epub_path,
            cover_path,
            meta_title: self.meta_title,
            meta_creator: self.meta_creator,
            meta_description: self.meta_description,
            meta_pubdate: self.meta_pubdate,
            meta_publisher: self.meta_publisher,
            meta_identifier: self.meta_identifier,
            meta_language: self.meta_language,
            meta_rights: self.meta_rights,
            meta_modified_date: self.meta_modified_date,
            meta_layout: self.meta_layout,
            meta_orientation: self.meta_orientation,
            meta_flow: self.meta_flow,
            meta_viewport: self.meta_viewport,
            meta_spread: self.meta_spread,
        }
    }
    pub fn with_absolute_paths_auto(self, library_path: &Path) -> BookAbsolutePath {
        let container_path = library_path.join(&self.book_id);
        let epub_path = container_path.join(&self.epub_file);
        let cover_path = self
            .cover_file
            .as_ref()
            .map(|cover_file| container_path.join(cover_file));

        self.with_absolute_paths(epub_path, cover_path)
    }
}
