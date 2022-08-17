use std::path::PathBuf;

use directories_next::ProjectDirs;
use serde::Serialize;

#[derive(Serialize)]
pub struct ProjectDirsSerializble {
    data_dir: PathBuf,
    config_dir: PathBuf,
}

#[tauri::command]
pub fn get_project_dirs() -> ProjectDirsSerializble {
    let dirs = ProjectDirs::from("com", "snorkysnark", "Moon Quote")
        .expect("Cannot find ProjectDirs paths");

    ProjectDirsSerializble {
        data_dir: dirs.data_dir().into(),
        config_dir: dirs.config_dir().into(),
    }
}
