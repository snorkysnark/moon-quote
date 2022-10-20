mod commands;

use std::thread;

use tauri::{plugin::Plugin, Invoke, Manager, Runtime};

use self::commands::InitialUrlOnce;
use super::{DeeplinkServer, TargetUrl};

pub struct DeeplinkPlugin<R: Runtime> {
    initial_url: Option<TargetUrl>,
    invoke_handler: Box<dyn Fn(Invoke<R>) + Send + Sync>,
}

impl<R: Runtime> DeeplinkPlugin<R> {
    pub fn new(initial_url: Option<TargetUrl>) -> Self {
        Self {
            initial_url,
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
        thread::spawn(move || {
            server.run();
        });

        Ok(())
    }

    fn extend_api(&mut self, invoke: Invoke<R>) {
        (self.invoke_handler)(invoke);
    }
}
