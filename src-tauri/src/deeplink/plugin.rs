use tauri::{async_runtime::JoinHandle, plugin::Plugin, Manager, Runtime};

use super::{url::AnnotationUrlLoaded, AnnotationUrl, DeeplinkServer};

pub struct DeeplinkPlugin {
    initial_url: Option<AnnotationUrl>,
    goto_annotation_once: Option<AnnotationUrlLoaded>,
    server_handle: Option<JoinHandle<()>>,
}

impl DeeplinkPlugin {
    pub fn new(initial_url: Option<AnnotationUrl>) -> Self {
        Self {
            initial_url,
            goto_annotation_once: None,
            server_handle: None,
        }
    }
}

impl<R: Runtime> Plugin<R> for DeeplinkPlugin {
    fn name(&self) -> &'static str {
        "moonquote_deeplink"
    }

    fn initialize(
        &mut self,
        app: &tauri::AppHandle<R>,
        _: serde_json::Value,
    ) -> tauri::plugin::Result<()> {
        // If there was a URL argument, load that annotation from the database
        if let Some(initial_url) = &self.initial_url {
            match initial_url.load(app) {
                Ok(goto_annotation) => self.goto_annotation_once = Some(goto_annotation),
                Err(err) => eprintln!("Cannot load annotation from url: {err}"),
            }
        }

        // Start server in the background
        let server = DeeplinkServer::new(app.app_handle())?;
        self.server_handle = Some(tauri::async_runtime::spawn(
            async move { server.run().await },
        ));

        Ok(())
    }

    fn on_page_load(&mut self, window: tauri::Window<R>, _: tauri::PageLoadPayload) {
        // If there was an initial URL, fire goto_annotation event when page is loaded
        if let Some(goto_annotation) = self.goto_annotation_once.take() {
            if let Err(err) = window.emit_all("goto_annotation", goto_annotation) {
                eprintln!("Can't emit event on page load: {err}");
            }
        }
    }
}

impl Drop for DeeplinkPlugin {
    fn drop(&mut self) {
        if let Some(server_handle) = &self.server_handle {
            // Kill server
            server_handle.abort();
        }
    }
}
