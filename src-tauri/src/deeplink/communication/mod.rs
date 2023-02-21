mod server;
mod client;

use interprocess::local_socket::NameTypeSupport;
use serde::{Deserialize, Serialize};

use super::TargetUrl;

pub use self::{server::DeeplinkServer, client::DeeplinkClient};

// Message used to communicate between app instances
#[derive(Serialize, Deserialize)]
pub enum Message {
    Focus,
    GoToTarget(TargetUrl),
}

impl From<TargetUrl> for Message {
    fn from(url: TargetUrl) -> Self {
        Message::GoToTarget(url)
    }
}

pub(self) fn socket_name() -> &'static str {
    use NameTypeSupport::*;
    match NameTypeSupport::query() {
        OnlyPaths => "/tmp/moonquote.sock",
        OnlyNamespaced | Both => "@moonquote.sock",
    }
}
