use std::str::FromStr;

use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};
use tauri::AppHandle;
use url::Url;

use super::target::TargetLoaded;

// Represents a url like 'moonquote:///annotation/<id>',
// 'moonquote:///book/<id>/range/<cfi>' or 'moonquote:///book/<id>/nav/<href>'
#[derive(Serialize, Deserialize)]
pub enum TargetUrl {
    Annotation { annotation_id: i32 },
    Range { book_id: String, cfi: String },
    Chapter { book_id: String, href: String },
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
                    Some(&["annotation", annotation_id]) => Ok(TargetUrl::Annotation {
                        annotation_id: annotation_id.parse()?,
                    }),
                    Some(&["book", book_id, "range", cfi]) => Ok(TargetUrl::Range {
                        book_id: percent_decode_utf8(book_id)?,
                        cfi: percent_decode_utf8(cfi)?,
                    }),
                    Some(&["book", book_id, "nav", href]) => Ok(TargetUrl::Chapter {
                        book_id: percent_decode_utf8(book_id)?,
                        href: percent_decode_utf8(href)?,
                    }),
                    _ => Err(anyhow!("Unexpected url path: {:?}", path_segments)),
                }
            }
            other => Err(anyhow!("Unexpected url scheme: {}", other)),
        }
    }
}

impl TargetUrl {
    pub fn load(self, app: &AppHandle) -> anyhow::Result<TargetLoaded> {
        TargetLoaded::load_from_url(app, self)
    }
}
