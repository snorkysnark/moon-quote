mod commands;

use tauri::{async_runtime::JoinHandle, plugin::Plugin, Invoke, Manager, Runtime};

use self::commands::InitialUrlOnce;

use super::{TargetUrl, DeeplinkServer};

pub struct DeeplinkPlugin<R: Runtime> {
    initial_url: Option<TargetUrl>,
    server_handle: Option<JoinHandle<()>>,
    invoke_handler: Box<dyn Fn(Invoke<R>) + Send + Sync>,
}

impl<R: Runtime> DeeplinkPlugin<R> {
    pub fn new(initial_url: Option<TargetUrl>) -> Self {
        Self {
            initial_url,
            server_handle: None,
            invoke_handler: Box::new(tauri::generate_handler![commands::initial_url]),
        }
    }
}

impl<R: Runtime> Plugin<R> for DeeplinkPlugin<R> {
    fn name(&self) -> &'static str {
        "deeplink"
    }

    fn initialize(
        &mut self,
        app: &tauri::AppHandle<R>,
        _: serde_json::Value,
    ) -> tauri::plugin::Result<()> {
        // If there was a URL argument, load that annotation from the database
        let goto_annotation = self.initial_url.take().and_then(|url| match url.load(app) {
            Ok(goto_annotation) => Some(goto_annotation),
            Err(err) => {
                eprintln!("Cannot load annotation from url: {err}");
                None
            }
        });
        app.manage(InitialUrlOnce::from(goto_annotation));

        // Start server in the background
        let server = DeeplinkServer::new(app.app_handle())?;
        self.server_handle = Some(tauri::async_runtime::spawn(
            async move { server.run().await },
        ));

        Ok(())
    }

    fn extend_api(&mut self, invoke: Invoke<R>) {
        (self.invoke_handler)(invoke);
    }
}

impl<R: Runtime> Drop for DeeplinkPlugin<R> {
    fn drop(&mut self) {
        if let Some(server_handle) = &self.server_handle {
            // Kill server
            server_handle.abort();
        }
    }
}
