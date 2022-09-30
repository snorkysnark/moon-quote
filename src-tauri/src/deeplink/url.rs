use std::str::FromStr;

use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};
use tauri::{Manager, Runtime};
use url::Url;

use crate::library::{self, Book, BookAnnotation};

// Represents a url like 'moonquote:///book/<id>/annotation/<id>'
#[derive(Serialize, Deserialize)]
pub struct AnnotationUrl {
    book_id: String,
    cfi: String,
}

#[derive(Clone, Serialize)]
#[serde(untagged)]
pub enum AnnotationData {
    Existing(BookAnnotation),
    New(String),
}

#[derive(Clone, Serialize)]
pub struct AnnotationUrlLoaded {
    book: Book,
    annotation: AnnotationData,
}

fn percent_decode_utf8(string: &str) -> Result<String> {
    Ok(percent_encoding::percent_decode_str(string)
        .decode_utf8()?
        .to_string())
}

impl FromStr for AnnotationUrl {
    type Err = anyhow::Error;

    fn from_str(url_string: &str) -> Result<Self, Self::Err> {
        let url = Url::parse(url_string)?;

        match url.scheme() {
            "moonquote" => {
                let path_segments: Option<Vec<_>> = url.path_segments().map(|c| c.collect());

                if let Some(&["book", book_id, "annotation", cfi]) = path_segments.as_deref() {
                    Ok(AnnotationUrl {
                        book_id: percent_decode_utf8(book_id)?,
                        cfi: percent_decode_utf8(cfi)?,
                    })
                } else {
                    Err(anyhow!("Unexpected url path: {:?}", path_segments))
                }
            }
            other => Err(anyhow!("Unexpected url scheme: {}", other)),
        }
    }
}

impl ToString for AnnotationUrl {
    fn to_string(&self) -> String {
        format!("moonquote:///book/{}/annotation/{}", self.book_id, self.cfi)
    }
}

impl AnnotationUrl {
    pub fn load<R: Runtime>(self, app: &tauri::AppHandle<R>) -> Result<AnnotationUrlLoaded> {
        let book = library::get_book(app.state(), app.state(), &self.book_id)?;
        match library::get_annotation(app.state(), &self.book_id, &self.cfi) {
            Ok(annotation) => Ok(AnnotationUrlLoaded {
                book,
                annotation: AnnotationData::Existing(annotation),
            }),
            Err(_) => Ok(AnnotationUrlLoaded {
                book,
                annotation: AnnotationData::New(self.cfi),
            }),
        }
    }
}
