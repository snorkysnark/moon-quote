use std::io::{self, BufRead, BufReader, Write};

use anyhow::{anyhow, Context, Result};
use interprocess::local_socket::{LocalSocketListener, LocalSocketStream, NameTypeSupport};
use serde::Serialize;
use tauri::{AppHandle, State};
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

fn socket_name() -> &'static str {
    use NameTypeSupport::*;
    match NameTypeSupport::query() {
        OnlyPaths => "/tmp/moonquote.sock",
        OnlyNamespaced | Both => "@moonquote.sock",
    }
}

pub fn deeplink_server(app: AppHandle) -> Result<()> {
    let socket = socket_name();
    let listener = LocalSocketListener::bind(socket)?;
    eprintln!("Listening on {socket}");

    fn handle_error(result: io::Result<LocalSocketStream>) -> Option<LocalSocketStream> {
        match result {
            Ok(conn) => Some(conn),
            Err(err) => {
                eprintln!("Incoming connection failed: {err}");
                None
            }
        }
    }

    let mut buffer = String::with_capacity(128);
    for conn in listener.incoming().filter_map(handle_error) {
        let mut conn = BufReader::new(conn);
        eprintln!("Incoming connection!");

        if let Err(error) = conn.read_line(&mut buffer) {
            eprintln!("Failed to read incoming message: {error}")
        } else {
            eprintln!("Incoming message: {buffer}");
        }

        buffer.clear();
    }

    Ok(())
}

pub fn try_send(message: &str) -> Result<()> {
    let socket = socket_name();
    let conn = LocalSocketStream::connect(socket).context("Failed to connect to server")?;
    let mut conn = BufReader::new(conn);
    eprintln!("Connected to {socket}");

    let message = format!("{message}\n");
    if let Err(error) = conn.get_mut().write_all(message.as_bytes()) {
        eprintln!("Failed to write message: {error}");
    }

    Ok(())
}
