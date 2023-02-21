use std::io::{prelude::*, BufReader};

use anyhow::{anyhow, Context, Result};
use interprocess::local_socket::{LocalSocketListener, LocalSocketStream};
use tauri::{AppHandle, Manager};

use super::Message;

// Runs on the main window, listens to incoming messages, such as GoToAnnotation
pub struct DeeplinkServer {
    app: AppHandle,
}
impl DeeplinkServer {
    pub fn new(app: AppHandle) -> Result<Self> {
        Ok(Self { app })
    }

    pub fn run(&self) {
        let listener =
            LocalSocketListener::bind(super::socket_name()).expect("Can't bind to socket");

        listener
            .incoming()
            .filter_map(|result| match result {
                Ok(conn) => Some(conn),
                Err(err) => {
                    eprintln!("Incoming connection failed: {err}");
                    None
                }
            })
            .for_each(|conn| {
                if let Err(err) = self.handle_connection(conn) {
                    eprintln!("Error while handling connection: {}", err);
                }
            });
    }

    fn handle_connection(&self, conn: LocalSocketStream) -> Result<()> {
        let mut conn = BufReader::new(conn);
        let mut buffer = String::new();
        conn.read_line(&mut buffer)?;

        let message: Message =
            serde_json::from_str(&buffer).with_context(|| format!("Invalid message: {buffer}"))?;
        self.handle_message(message)?;

        Ok(())
    }

    fn handle_message(&self, message: Message) -> Result<()> {
        match message {
            Message::Focus => self.app.set_window_focused("main")?,
            Message::GoToTarget(link) => {
                let link_data = link.load(&self.app)?;
                self.app.emit_all("goto_url", link_data)?;
                self.app.set_window_focused("main")?;
            }
        }

        Ok(())
    }
}

trait AppHandleExt {
    fn set_window_focused(&self, name: &str) -> Result<()>;
}

impl AppHandleExt for AppHandle {
    fn set_window_focused(&self, name: &str) -> Result<()> {
        match self.get_window(name) {
            Some(window) => {
                window.show()?;
                window.set_focus()?;
                Ok(())
            }
            None => Err(anyhow!("Window {} not found", name)),
        }
    }
}
