use std::time::Duration;

use notify::{RecommendedWatcher, RecursiveMode};
use notify_debouncer_mini::{new_debouncer, Debouncer};
use tauri::{plugin::Plugin, AppHandle, Invoke, Manager, Runtime, State};

use crate::Constants;

use super::get_scripts;

pub struct ExportersPlugin<R: Runtime> {
    // watcher will be dropped when this plugin in unloaded
    _debouncer: Option<Debouncer<RecommendedWatcher>>,
    invoke_handler: Box<dyn Fn(Invoke<R>) + Send + Sync>,
}

impl<R: Runtime> ExportersPlugin<R> {
    pub fn new() -> Self {
        Self {
            _debouncer: None,
            invoke_handler: Box::new(tauri::generate_handler![get_scripts::get_exporters]),
        }
    }
}

impl<R: Runtime> Plugin<R> for ExportersPlugin<R> {
    fn name(&self) -> &'static str {
        "exporters"
    }

    fn initialize(
        &mut self,
        app: &AppHandle<R>,
        _: serde_json::Value,
    ) -> tauri::plugin::Result<()> {
        let app_handle = app.app_handle();

        let mut debouncer = new_debouncer(Duration::from_millis(500), None, move |results| {
            get_scripts::handle_change_event(&app_handle, results);
        })?;

        let constants: State<Constants> = app.state();
        debouncer
            .watcher()
            .watch(&constants.exporters_path, RecursiveMode::NonRecursive)?;

        // Debouncer should live as long as the plugin lives
        self._debouncer = Some(debouncer);
        Ok(())
    }

    fn extend_api(&mut self, invoke: Invoke<R>) {
        (self.invoke_handler)(invoke);
    }
}
