use std::str::FromStr;

use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};
use tauri::{Manager, Runtime};
use url::Url;

use crate::library::{self, Book, BookAnnotation};

// Represents a url like 'moonquote:///book/<id>/annotation/<cfi>'
// or 'moonquote:///book/<id>/nav/<href>'
#[derive(Serialize, Deserialize)]
pub struct TargetUrl {
    book_id: String,
    target: Target,
}

#[derive(Serialize, Deserialize)]
#[serde(tag = "type", content = "value")]
pub enum Target {
    Annotation(String),
    Chapter(String),
}

fn percent_decode_utf8(string: &str) -> Result<String> {
    Ok(percent_encoding::percent_decode_str(string)
        .decode_utf8()?
        .to_string())
}

impl FromStr for TargetUrl {
    type Err = anyhow::Error;

    fn from_str(url_string: &str) -> Result<Self, Self::Err> {
        let url = Url::parse(url_string)?;

        match url.scheme() {
            "moonquote" => {
                let path_segments: Option<Vec<_>> = url.path_segments().map(|c| c.collect());

                match path_segments.as_deref() {
                    Some(&["book", book_id, "annotation", cfi]) => Ok(TargetUrl {
                        book_id: percent_decode_utf8(book_id)?,
                        target: Target::Annotation(percent_decode_utf8(cfi)?),
                    }),
                    Some(&["book", book_id, "nav", href]) => Ok(TargetUrl {
                        book_id: percent_decode_utf8(book_id)?,
                        target: Target::Chapter(percent_decode_utf8(href)?),
                    }),
                    _ => Err(anyhow!("Unexpected url path: {:?}", path_segments)),
                }
            }
            other => Err(anyhow!("Unexpected url scheme: {}", other)),
        }
    }
}

#[derive(Clone, Serialize)]
pub struct TargetUrlLoaded {
    book: Book,
    target: TargetLoaded,
}

#[derive(Clone, Serialize)]
#[serde(tag = "type", content = "value")]
pub enum TargetLoaded {
    Annotation(BookAnnotation),
    Range(String),
    Chapter(String),
}

impl TargetUrl {
    pub fn load<R: Runtime>(self, app: &tauri::AppHandle<R>) -> Result<TargetUrlLoaded> {
        let book = library::get_book(app.state(), app.state(), &self.book_id)?;

        let target = match self.target {
            Target::Annotation(cfi) => {
                match library::get_annotation(app.state(), &self.book_id, &cfi) {
                    Ok(annotation) => TargetLoaded::Annotation(annotation),
                    Err(_) => TargetLoaded::Range(cfi),
                }
            }
            Target::Chapter(href) => TargetLoaded::Chapter(href),
        };

        Ok(TargetUrlLoaded { book, target })
    }
}
