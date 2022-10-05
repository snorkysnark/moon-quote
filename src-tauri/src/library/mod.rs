mod annotations;
mod data;
mod delete_book;
mod get_books;
mod upload_book;

use crate::commands::pub_use_hidden;

pub_use_hidden!( upload_book => upload_book );
pub_use_hidden!( get_books => get_books, get_book );
pub_use_hidden!( delete_book => delete_book );
pub_use_hidden!( annotations => add_annotation, get_annotations_for_book, get_annotation, delete_annotation );

pub use data::{Book, BookAnnotation};
