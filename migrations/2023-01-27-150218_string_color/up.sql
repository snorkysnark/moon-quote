-- Your SQL goes here
CREATE TABLE annotations_new (
    book_id text NOT NULL,
    cfi text NOT NULL,
    text_content text NOT NULL,
    color text NOT NULL,
    comment text,
    collapsed BOOLEAN NOT NULL DEFAULT FALSE,

    PRIMARY KEY (book_id, cfi),

    FOREIGN KEY (book_id) REFERENCES books (book_id)
        ON DELETE CASCADE
);

INSERT INTO annotations_new SELECT
    book_id,
    cfi,
    text_content,
    'var(--highlight' || color || ')',
    comment,
    collapsed
FROM annotations;

DROP TABLE annotations;
ALTER TABLE annotations_new RENAME TO annotations;
