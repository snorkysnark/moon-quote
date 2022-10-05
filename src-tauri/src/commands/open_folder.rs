use std::{path::Path, process::Command};

use tauri::State;

use crate::{
    error::{sanyhow, SerializableResult},
    Constants,
};

#[tauri::command]
pub fn open_folder(path: &Path) -> SerializableResult<()> {
    let folder = if path.is_dir() {
        path
    } else {
        path.parent()
            .ok_or_else(|| sanyhow!("Cannot get parent folder"))?
    };

    let command = if cfg!(target_os = "windows") {
        "explorer"
    } else if cfg!(target_os = "linux") {
        "xdg-open"
    } else {
        return Err(sanyhow!("Unsupported OS"));
    };

    Command::new(command).arg(folder).spawn()?;
    Ok(())
}

#[tauri::command]
pub fn open_templates_folder(constants: State<Constants>) -> SerializableResult<()> {
    open_folder(&constants.templates_path)
}
