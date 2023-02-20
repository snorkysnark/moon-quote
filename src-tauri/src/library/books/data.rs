use std::path::{Path, PathBuf};

use diesel::{Insertable, Queryable};
use serde::{Deserialize, Serialize};

use crate::library::schema;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = schema::books)]
#[serde(rename_all = "camelCase")]
pub struct EpubMetadata {
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

// Represents a full row in the 'books' table of the database
#[derive(Debug, Queryable, Insertable)]
#[diesel(table_name = schema::books)]
pub struct BookRaw {
    pub book_id: String,
    pub epub_file: String,
    pub cover_file: Option<String>,
    #[diesel(embed)]
    pub metadata: EpubMetadata,
}

// Same as BookRaw, but with the relative paths replaced with absolute ones
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BookAbsolutePath {
    pub book_id: String,
    pub epub_path: PathBuf,
    pub cover_path: Option<PathBuf>,
    pub metadata: EpubMetadata,
}

impl BookRaw {
    pub fn with_absolute_paths(
        self,
        epub_path: PathBuf,
        cover_path: Option<PathBuf>,
    ) -> BookAbsolutePath {
        BookAbsolutePath {
            book_id: self.book_id,
            epub_path,
            cover_path,
            metadata: self.metadata,
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
