mod commands;
mod communication;
mod target;
mod url;

use std::thread;

use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Wry,
};

use self::{commands::InitialTarget, communication::DeeplinkServer};
pub use self::{
    communication::{DeeplinkClient, Message},
    url::TargetUrl,
};

pub fn plugin(initial_url: Option<TargetUrl>) -> TauriPlugin<Wry> {
    Builder::new("deeplink")
        .setup(move |app_handle| {
            // If there was a URL argument, load that annotation from the database
            let initial_target = initial_url
                .and_then(|url| match url.load(app_handle) {
                    Ok(target) => Some(target),
                    Err(err) => {
                        eprintln!("Cannot load target from url: {err}");
                        None
                    }
                });
            app_handle.manage(InitialTarget::from(initial_target));

            // Start server in the background
            let server = DeeplinkServer::new(app_handle.app_handle())?;
            thread::spawn(move || {
                server.run();
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![commands::initial_target])
        .build()
}
