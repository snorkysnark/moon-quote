use diesel::{Insertable, Queryable};
use serde::{Deserialize, Serialize};

use crate::{
    library::{
        books::{Book, BookRaw},
        schema,
    },
    utils::const_columns,
};

#[derive(Debug, Clone, Queryable, Serialize, Deserialize, Insertable)]
#[diesel(table_name = schema::annotations)]
#[serde(rename_all = "camelCase")]
pub struct AnnotationData {
    pub book_id: String,
    pub cfi: String,
    pub text_content: String,
    pub color: String,
    pub comment: Option<String>,
    pub collapsed: bool,
}

#[derive(Debug, Clone, Queryable, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Annotation {
    pub annotation_id: i32,
    #[serde(flatten)]
    pub data: AnnotationData,
}

#[derive(Debug, Queryable)]
pub struct AnnotationFullRaw {
    pub book: BookRaw,
    pub annotation: Annotation,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnnotationFull {
    pub book: Book,
    pub annotation: Annotation,
}

impl Annotation {
    const_columns!(
        pub const COLUMNS = (
            schema::annotations::annotation_id,
            (
                schema::annotations::book_id,
                schema::annotations::cfi,
                schema::annotations::text_content,
                schema::annotations::color,
                schema::annotations::comment,
                schema::annotations::collapsed,
            )
        )
    );
}
