use std::{collections::HashMap, fs, path::PathBuf};

use tauri::State;

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

#[tauri::command]
pub fn get_exporters(constants: State<Constants>) -> SerializableResult<HashMap<String, String>> {
    let mut exporters = HashMap::new();

    for (name, path) in fs::read_dir(&constants.exporters_path)?
        .into_iter()
        .flat_map(|result| result.ok())
        .map(|entry| entry.path())
        .filter_map(named_js_path)
    {
        let content = fs::read_to_string(&path)?;
        let encoded = format!(
            "data:text/javascript;base64,{}",
            base64::encode(content.as_bytes())
        );
        exporters.insert(name, encoded);
    }

    Ok(exporters)
}
