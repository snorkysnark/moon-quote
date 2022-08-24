CREATE TABLE books (
    book_id INTEGER PRIMARY KEY AUTOINCREMENT,

    epub_path text NOT NULL,
    cover_path text,

    meta_title text NOT NULL,
    meta_creator text,
    meta_description text,
    meta_pubdate
    meta_publisher text,
    meta_identifier text,
    meta_language text,
    meta_rights text,
    meta_modified_date text,
    meta_layout text,
    meta_orientation text,
    meta_flow text,
    meta_viewport text,
    meta_media_active_class text,
    meta_spread text,
    meta_direction text
);
