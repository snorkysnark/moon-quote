use interprocess::local_socket::NameTypeSupport;

mod url;
mod message;
mod server;
mod plugin;
mod client;

pub use self::url::AnnotationUrl;
pub use self::message::Message;
pub use server::DeeplinkServer;
pub use client::DeeplinkClient;
pub use plugin::DeeplinkPlugin;

pub(self) fn socket_name() -> &'static str {
    use NameTypeSupport::*;
    match NameTypeSupport::query() {
        OnlyPaths => "/tmp/moonquote.sock",
        OnlyNamespaced | Both => "@moonquote.sock",
    }
}
