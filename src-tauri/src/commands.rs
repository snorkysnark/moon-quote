use std::path::PathBuf;

use tauri::AppHandle;

#[tauri::command]
pub fn app_data_dir(app_handle: AppHandle) -> Option<PathBuf> {
    tauri::api::path::data_dir().map(|dir| dir.join(&app_handle.config().tauri.bundle.identifier))
}

#[tauri::command]
pub fn path_exists(path: PathBuf) -> bool {
    path.exists()
}
