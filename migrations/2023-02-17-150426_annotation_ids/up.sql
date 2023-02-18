-- Your SQL goes here
CREATE TABLE annotations_new(
    annotation_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    book_id text NOT NULL,
    cfi text NOT NULL,
    text_content text NOT NULL,
    color text NOT NULL,
    comment text,
    collapsed BOOLEAN NOT NULL DEFAULT FALSE,

    UNIQUE(book_id, cfi),

    FOREIGN KEY (book_id) REFERENCES books (book_id)
        ON DELETE CASCADE
);
INSERT INTO annotations_new(
    book_id,
    cfi,
    text_content,
    color,
    comment,
    collapsed
) SELECT * FROM annotations;

DROP TABLE annotations;
ALTER TABLE annotations_new RENAME TO annotations;
