use std::{cell::Cell, sync::Mutex};

use tauri::State;

use crate::{
    deeplink::url::AnnotationUrlLoaded,
    error::{sanyhow, SerializableResult},
};

pub(super) struct InitialUrlOnce {
    initial_url: Mutex<Cell<Option<AnnotationUrlLoaded>>>,
}

impl From<Option<AnnotationUrlLoaded>> for InitialUrlOnce {
    fn from(initial_url: Option<AnnotationUrlLoaded>) -> Self {
        Self {
            initial_url: Mutex::new(Cell::new(initial_url)),
        }
    }
}

// Returns initial url the first time, then returns None
#[tauri::command]
pub(super) fn initial_url(
    state: State<InitialUrlOnce>,
) -> SerializableResult<Option<AnnotationUrlLoaded>> {
    let url = state.initial_url.lock().map_err(|err| sanyhow!("{err}"))?;
    Ok(url.take())
}
