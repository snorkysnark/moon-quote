use anyhow::{anyhow, Context, Result};
use futures::{io::BufReader, prelude::*};
use interprocess::nonblocking::local_socket::{LocalSocketListener, LocalSocketStream};
use tauri::{AppHandle, Manager, Runtime};

use super::message::Message;

// Runs on the main window, listens to incoming messages, such as GoToAnnotation
pub struct DeeplinkServer<R: Runtime> {
    app: AppHandle<R>,
    listener: LocalSocketListener,
}

impl<R: Runtime> DeeplinkServer<R> {
    pub fn new(app: AppHandle<R>) -> Result<Self> {
        let listener =
            tauri::async_runtime::block_on(LocalSocketListener::bind(super::socket_name()))?;

        Ok(Self { app, listener })
    }

    pub async fn run(&self) {
        self.listener
            .incoming()
            .filter_map(|result| async move {
                match result {
                    Ok(conn) => Some(conn),
                    Err(err) => {
                        eprintln!("Incoming connection failed: {err}");
                        None
                    }
                }
            })
            .for_each(|conn| async move {
                if let Err(err) = self.handle_connection(conn).await {
                    eprintln!("Error while handling connection: {}", err);
                }
            })
            .await;
    }

    async fn handle_connection(&self, conn: LocalSocketStream) -> Result<()> {
        let mut conn = BufReader::new(conn);
        let mut buffer = String::new();
        conn.read_line(&mut buffer).await?;

        let message: Message =
            serde_json::from_str(&buffer).with_context(|| format!("Invalid message: {buffer}"))?;
        self.handle_message(message)?;

        Ok(())
    }

    fn handle_message(&self, message: Message) -> Result<()> {
        match message {
            Message::Focus => self.app.set_window_focused("main")?,
            Message::GoToAnnotation(link) => {
                let link_data = link.load(&self.app)?;
                self.app.emit_all("goto_annotation", link_data)?;
                self.app.set_window_focused("main")?;
            }
        }

        Ok(())
    }
}

trait AppHandleExt {
    fn set_window_focused(&self, name: &str) -> Result<()>;
}

impl<R: Runtime> AppHandleExt for AppHandle<R> {
    fn set_window_focused(&self, name: &str) -> Result<()> {
        match self.get_window(name) {
            Some(window) => {
                window.set_focus()?;
                Ok(())
            }
            None => Err(anyhow!("Window {} not found", name)),
        }
    }
}
