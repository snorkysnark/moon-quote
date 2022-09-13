use anyhow::{anyhow, Result};
use serde::Serialize;
use tauri::State;
use url::Url;

use crate::Constants;

#[derive(Clone, Serialize)]
pub struct GoToAnnotation {
    book_id: i32,
    annotation_id: i32,
}

impl GoToAnnotation {
    pub fn from_url_string(url: &str) -> Result<Self> {
        let parsed = Url::parse(url)?;

        if parsed.scheme() != "moonquote" {
            return Err(anyhow!("Unexpected url scheme: {}", parsed.scheme()));
        }
        let path_segments: Option<Vec<_>> = parsed.path_segments().map(|c| c.collect());
        if let Some(&["book", book_id, "annotation", annotation_id]) = path_segments.as_deref() {
            Ok(GoToAnnotation {
                book_id: book_id.parse()?,
                annotation_id: annotation_id.parse()?,
            })
        } else {
            Err(anyhow!("Unexpected url path: {:?}", path_segments))
        }
    }
}

#[tauri::command]
pub fn initial_annotation_link(constants: State<Constants>) -> Option<GoToAnnotation> {
    constants.initial_annotation_link.clone()
}
