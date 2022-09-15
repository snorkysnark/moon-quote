use std::str::FromStr;

use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};
use tauri::{Manager, Runtime};
use url::Url;

use crate::library::{self, Book, BookAnnotation};

// Represents a url like 'moonquote:///book/<id>/annotation/<id>'
#[derive(Serialize, Deserialize)]
pub struct AnnotationUrl {
    book_id: i32,
    annotation_id: i32,
}

#[derive(Clone, Serialize)]
pub struct AnnotationUrlLoaded {
    book: Book<'static>,
    annotation: BookAnnotation<'static>,
}

impl FromStr for AnnotationUrl {
    type Err = anyhow::Error;

    fn from_str(url_string: &str) -> Result<Self, Self::Err> {
        let url = Url::parse(url_string)?;

        match url.scheme() {
            "moonquote" => {
                let path_segments: Option<Vec<_>> = url.path_segments().map(|c| c.collect());

                if let Some(&["book", book_id, "annotation", annotation_id]) =
                    path_segments.as_deref()
                {
                    Ok(AnnotationUrl {
                        book_id: book_id.parse()?,
                        annotation_id: annotation_id.parse()?,
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
        format!(
            "moonquote:///book/{}/annotation/{}",
            self.book_id, self.annotation_id
        )
    }
}

impl AnnotationUrl {
    pub fn load<R: Runtime>(&self, app: &tauri::AppHandle<R>) -> Result<AnnotationUrlLoaded> {
        let book = library::get_book(app.state(), app.state(), self.book_id)?;
        let annotation = library::get_annotation(app.state(), self.annotation_id)?;

        Ok(AnnotationUrlLoaded { book, annotation })
    }
}
