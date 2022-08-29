// @generated automatically by Diesel CLI.

diesel::table! {
    books (book_id) {
        book_id -> Integer,
        epub_file -> Text,
        cover_file -> Nullable<Text>,
        meta_title -> Nullable<Text>,
        meta_creator -> Nullable<Text>,
        meta_description -> Nullable<Text>,
        meta_pubdate -> Nullable<Text>,
        meta_publisher -> Nullable<Text>,
        meta_identifier -> Nullable<Text>,
        meta_language -> Nullable<Text>,
        meta_rights -> Nullable<Text>,
        meta_modified_date -> Nullable<Text>,
        meta_layout -> Nullable<Text>,
        meta_orientation -> Nullable<Text>,
        meta_flow -> Nullable<Text>,
        meta_viewport -> Nullable<Text>,
        meta_spread -> Nullable<Text>,
    }
}
