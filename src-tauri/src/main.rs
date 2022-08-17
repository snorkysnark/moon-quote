#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use directories_next::ProjectDirs;
use serde::Serialize;
use std::path::PathBuf;

#[derive(Serialize)]
struct ProjectDirsSerializble {
    data_dir: PathBuf,
    config_dir: PathBuf,
}

#[tauri::command]
fn get_project_dirs() -> ProjectDirsSerializble {
    let dirs =
        ProjectDirs::from("com", "snorkysnark", "Moon Quote").expect("Cannot ProjectDirs paths");

    ProjectDirsSerializble {
        data_dir: dirs.data_dir().into(),
        config_dir: dirs.config_dir().into(),
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_project_dirs])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
