CREATE TABLE books (
    book_id INTEGER NOT NULL PRIMARY KEY,
    epub_file text NOT NULL,
    cover_file text,
    meta_title text,
    meta_creator text,
    meta_description text,
    meta_pubdate text,
    meta_publisher text,
    meta_identifier text,
    meta_language text,
    meta_rights text,
    meta_modified_date text,
    meta_layout text,
    meta_orientation text,
    meta_flow text,
    meta_viewport text,
    meta_spread text
);
