use serde::{Serialize, Deserialize};

use super::url::AnnotationUrl;

// Message used to communicate between app instances
#[derive(Serialize, Deserialize)]
pub enum Message {
    Focus,
    GoToAnnotation(AnnotationUrl),
}

impl From<AnnotationUrl> for Message {
    fn from(link: AnnotationUrl) -> Self {
        Message::GoToAnnotation(link)
    }
}
