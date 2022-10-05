use std::{fs, io, path::Path};

use include_dir::{include_dir, Dir};
use serde::Serialize;
use tauri::{
    plugin::{Builder, TauriPlugin},
    Runtime, State,
};

use crate::{error::SerializableResult, Constants};

static DEFAULT_TEMPLATES: Dir<'_> = include_dir!("$CARGO_MANIFEST_DIR/xslt");

pub fn create_templates_dir(path: &Path) -> io::Result<()> {
    if !path.exists() {
        fs::create_dir_all(path)?;
        DEFAULT_TEMPLATES.extract(path)?;
    }
    Ok(())
}

#[derive(Serialize)]
pub struct Template {
    name: String,
    source: String,
}

#[tauri::command]
pub fn get_templates(constants: State<Constants>) -> SerializableResult<Vec<Template>> {
    let mut templates = Vec::new();

    for path in fs::read_dir(&constants.templates_path)?
        .into_iter()
        .flat_map(|result| result.ok())
        .map(|entry| entry.path())
        .filter(|path| matches!(path.extension().and_then(|ext| ext.to_str()), Some("xslt")))
    {
        if let Some(stem) = path
            .file_stem()
            .and_then(|stem| stem.to_str())
            .map(ToOwned::to_owned)
        {
            let source = fs::read_to_string(&path)?;
            templates.push(Template { name: stem, source });
        }
    }

    Ok(templates)
}

pub fn plugin<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("xslt_templates")
        .invoke_handler(tauri::generate_handler![get_templates])
        .build()
}
