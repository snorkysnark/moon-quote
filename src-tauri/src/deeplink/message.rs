use serde::{Deserialize, Serialize};

use super::url::TargetUrl;

// Message used to communicate between app instances
#[derive(Serialize, Deserialize)]
pub enum Message {
    Focus,
    GoToTarget(TargetUrl),
}

impl From<TargetUrl> for Message {
    fn from(link: TargetUrl) -> Self {
        Message::GoToTarget(link)
    }
}
