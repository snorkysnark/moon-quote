use tauri::{AppHandle, WindowBuilder, WindowUrl};

use crate::error::SerializableResult;

#[tauri::command]
pub async fn open_search(app: AppHandle) -> SerializableResult<()> {
    WindowBuilder::new(&app, "search", WindowUrl::App("search.html".parse()?))
        .always_on_top(true)
        .decorations(false)
        .center()
        .focus()
        .title("Search")
        .build()?;

    Ok(())
}
