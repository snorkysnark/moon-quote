-- This file should undo anything in `up.sql`
DROP TABLE annotations;
CREATE TABLE annotations (
    book_id text NOT NULL,
    cfi text NOT NULL,
    text_content text NOT NULL,
    color INTEGER NOT NULL,

    PRIMARY KEY (book_id, cfi),

    FOREIGN KEY (book_id) REFERENCES books (book_id)
        ON DELETE CASCADE
);
