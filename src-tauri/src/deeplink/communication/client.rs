use anyhow::Result;
use interprocess::local_socket::LocalSocketStream;
use std::io::{BufReader, Write};

use super::Message;

pub struct DeeplinkClient {
    conn: BufReader<LocalSocketStream>,
}

impl DeeplinkClient {
    pub fn new() -> Result<Self> {
        let stream = LocalSocketStream::connect(super::socket_name())?;
        Ok(Self {
            conn: BufReader::new(stream),
        })
    }

    pub fn send_message(&mut self, message: &Message) -> Result<()> {
        let message = serde_json::to_string(message)?;
        self.conn
            .get_mut()
            .write_all(format!("{message}\n").as_bytes())?;

        Ok(())
    }
}
