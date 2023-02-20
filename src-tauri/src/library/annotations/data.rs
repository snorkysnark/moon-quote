use diesel::{Insertable, Queryable};
use serde::{Deserialize, Serialize};

use crate::{library::schema, utils::const_columns};

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

#[derive(Debug, Clone, Queryable, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Annotation {
    pub annotation_id: i32,
    #[serde(flatten)]
    pub data: AnnotationData,
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
