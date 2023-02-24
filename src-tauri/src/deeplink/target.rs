use anyhow::Result;
use serde::Serialize;
use tauri::{AppHandle, Manager};

use crate::library::{self, Annotation, Book};

use super::url::TargetUrl;

#[derive(Debug, Clone, Serialize)]
pub struct TargetLoaded {
    book: Book,
    data: TargetLoadedData,
}

#[derive(Debug, Clone, Serialize)]
#[serde(tag = "type", content = "value")]
pub enum TargetLoadedData {
    Annotation(Annotation),
    Range(String),
    Chapter(String),
}

impl TargetLoaded {
    pub fn load_from_url(app: &AppHandle, target_url: TargetUrl) -> Result<Self> {
        match target_url {
            TargetUrl::Annotation { annotation_id } => {
                let annotation = library::get_annotation(app.app_handle(), annotation_id)?;
                let book = library::get_book(app.app_handle(), &annotation.data.book_id)?;

                Ok(TargetLoaded {
                    book,
                    data: TargetLoadedData::Annotation(annotation),
                })
            }
            TargetUrl::Range { book_id, cfi } => Ok(TargetLoaded {
                book: library::get_book(app.app_handle(), &book_id)?,
                data: TargetLoadedData::Range(cfi),
            }),
            TargetUrl::Chapter { book_id, href } => Ok(TargetLoaded {
                book: library::get_book(app.app_handle(), &book_id)?,
                data: TargetLoadedData::Chapter(href),
            }),
        }
    }
}
