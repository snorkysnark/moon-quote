use diesel::Queryable;
use serde::Serialize;

#[derive(Debug, Clone, Queryable, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Annotation {
    pub annotation_id: i32,
    pub book_id: String,
    pub cfi: String,
    pub text_content: String,
    pub color: String,
    pub comment: Option<String>,
    pub collapsed: bool,
}
