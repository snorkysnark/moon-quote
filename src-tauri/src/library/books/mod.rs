mod data;
mod delete_book;
mod get_books;
mod upload_book;

use crate::utils::pub_use_commands;

pub_use_commands!(get_books => { get_books, get_book });
pub_use_commands!(delete_book => { delete_book });
pub_use_commands!(upload_book => { upload_book });

pub use data::BookAbsolutePath as Book;
