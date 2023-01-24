-- Your SQL goes here
ALTER TABLE annotations
ADD COLUMN comment text;

ALTER TABLE annotations
ADD COLUMN collapsed BOOLEAN NOT NULL DEFAULT FALSE;
