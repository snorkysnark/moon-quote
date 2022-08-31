CREATE TABLE annotations (
    annotation_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    cfi text NOT NULL,
    text_content text NOT NULL,

    FOREIGN KEY (book_id) REFERENCES books (book_id)
        ON DELETE CASCADE
);
