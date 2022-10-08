use std::{
    collections::HashMap,
    fs, io,
    path::{Path, PathBuf},
};

use notify::RecommendedWatcher;
use notify_debouncer_mini::{DebounceEventResult, DebouncedEvent, Debouncer};
use serde::Serialize;
use tauri::{AppHandle, Manager, Runtime, State};

use crate::{error::SerializableResult, Constants};

fn named_js_path(path: PathBuf) -> Option<(String, PathBuf)> {
    match (
        path.file_stem()
            .and_then(|stem| stem.to_str())
            .map(ToOwned::to_owned),
        path.extension().and_then(|ext| ext.to_str()),
    ) {
        (Some(stem), Some("js")) => Some((stem, path)),
        _ => None,
    }
}

fn encode_script(path: &Path) -> io::Result<String> {
    let content = fs::read_to_string(&path)?;
    let encoded = format!(
        "data:text/javascript;base64,{}",
        base64::encode(content.as_bytes())
    );
    Ok(encoded)
}

#[tauri::command]
pub fn get_exporters(constants: State<Constants>) -> SerializableResult<HashMap<String, String>> {
    let mut exporters = HashMap::new();

    for (name, path) in fs::read_dir(&constants.exporters_path)?
        .into_iter()
        .flat_map(|result| result.ok())
        .map(|entry| entry.path())
        .filter_map(named_js_path)
    {
        exporters.insert(name, encode_script(&path)?);
    }

    Ok(exporters)
}

#[derive(Serialize, Clone, Default)]
struct TemplateReloadMessage {
    deleted: Vec<String>,
    updated: HashMap<String, String>,
}

pub fn handle_change_event(app: &AppHandle<impl Runtime>, result: DebounceEventResult) {
    pub fn try_handle_events(
        app: &AppHandle<impl Runtime>,
        events: Vec<DebouncedEvent>,
    ) -> anyhow::Result<()> {
        let mut message = TemplateReloadMessage::default();

        for (name, path) in events
            .into_iter()
            .map(|event| event.path)
            .filter_map(named_js_path)
        {
            if path.exists() {
                message.updated.insert(name, encode_script(&path)?);
            } else {
                message.deleted.push(name);
            }
        }

        app.emit_all("update_exporters", message)?;
        Ok(())
    }

    match result {
        Ok(events) => {
            if let Err(error) = try_handle_events(app, events) {
                eprintln!("{error}");
            }
        }
        Err(errors) => errors
            .iter()
            .for_each(|err| eprintln!("Watcher error: {err}")),
    }
}
