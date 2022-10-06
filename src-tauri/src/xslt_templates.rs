use std::{
    fs, io,
    path::{Path, PathBuf},
    time::Duration,
};

use anyhow::Result;
use include_dir::{include_dir, Dir};
use notify::{RecommendedWatcher, RecursiveMode};
use notify_debouncer_mini::{
    new_debouncer, DebounceEventHandler, DebounceEventResult, DebouncedEvent, Debouncer,
};
use serde::Serialize;
use tauri::{plugin::Plugin, AppHandle, Invoke, Manager, Runtime, State};

use crate::{error::SerializableResult, Constants};

static DEFAULT_TEMPLATES: Dir<'_> = include_dir!("$CARGO_MANIFEST_DIR/xslt");

pub fn create_templates_dir(path: &Path) -> io::Result<()> {
    if !path.exists() {
        fs::create_dir_all(path)?;
        DEFAULT_TEMPLATES.extract(path)?;
    }
    Ok(())
}

#[derive(Serialize, Clone)]
pub struct Template {
    name: String,
    source: String,
}

fn named_xslt_path(path: PathBuf) -> Option<(String, PathBuf)> {
    match (
        path.file_stem()
            .and_then(|stem| stem.to_str())
            .map(ToOwned::to_owned),
        path.extension().and_then(|ext| ext.to_str()),
    ) {
        (Some(stem), Some("xslt")) => Some((stem, path)),
        _ => None,
    }
}

#[tauri::command]
pub fn get_templates(constants: State<Constants>) -> SerializableResult<Vec<Template>> {
    let mut templates = Vec::new();

    for (stem, path) in fs::read_dir(&constants.templates_path)?
        .into_iter()
        .flat_map(|result| result.ok())
        .map(|entry| entry.path())
        .filter_map(named_xslt_path)
    {
        let source = fs::read_to_string(&path)?;
        templates.push(Template { name: stem, source });
    }

    Ok(templates)
}

struct TemplateChangeListener<R: Runtime> {
    app: AppHandle<R>,
}

#[derive(Serialize, Clone, Default)]
struct TemplateReloadMessage {
    deleted: Vec<String>,
    updated: Vec<Template>,
}

impl<R: Runtime> DebounceEventHandler for TemplateChangeListener<R> {
    fn handle_event(&mut self, result: DebounceEventResult) {
        fn try_handle_events<R: Runtime>(
            app: &AppHandle<R>,
            events: Vec<DebouncedEvent>,
        ) -> Result<()> {
            let mut message = TemplateReloadMessage::default();

            for (stem, path) in events
                .into_iter()
                .map(|event| event.path)
                .filter_map(named_xslt_path)
            {
                if path.exists() {
                    let source = fs::read_to_string(&path)?;
                    message.updated.push(Template { name: stem, source });
                } else {
                    message.deleted.push(stem);
                }
            }

            app.emit_all("templates_reload", message)?;
            Ok(())
        }

        match result {
            Ok(events) => {
                if let Err(error) = try_handle_events(&self.app, events) {
                    eprintln!("{error}");
                }
            }
            Err(errors) => errors
                .iter()
                .for_each(|err| eprintln!("Watcher error: {err}")),
        }
    }
}

pub struct XsltTemplatesPlugin<R: Runtime> {
    // watcher will be dropped when this plugin in unloaded
    _debouncer: Option<Debouncer<RecommendedWatcher>>,
    invoke_handler: Box<dyn Fn(Invoke<R>) + Send + Sync>,
}

impl<R: Runtime> XsltTemplatesPlugin<R> {
    pub fn new() -> Self {
        Self {
            _debouncer: None,
            invoke_handler: Box::new(tauri::generate_handler![get_templates]),
        }
    }
}

impl<R: Runtime> Plugin<R> for XsltTemplatesPlugin<R> {
    fn name(&self) -> &'static str {
        "xslt_templates"
    }

    fn initialize(
        &mut self,
        app: &AppHandle<R>,
        _: serde_json::Value,
    ) -> tauri::plugin::Result<()> {
        let mut debouncer = new_debouncer(
            Duration::from_millis(500),
            None,
            TemplateChangeListener {
                app: app.app_handle(),
            },
        )?;

        let constants: State<Constants> = app.state();
        debouncer
            .watcher()
            .watch(&constants.templates_path, RecursiveMode::NonRecursive)?;

        // Debouncer should live as long as the plugin lives
        self._debouncer = Some(debouncer);
        Ok(())
    }

    fn extend_api(&mut self, invoke: Invoke<R>) {
        (self.invoke_handler)(invoke);
    }
}
