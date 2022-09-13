// #[tauri::command] macro adds hidden exports to the module, so we have to reexport them
macro_rules! pub_use_hidden {
    ($module:path => $($command:ident),+)  => {
        ::paste::paste!{
            pub use $module::{$($command, [< __cmd__ $command >]),+};
        }
    }
}

mod annotations;
mod data;
mod delete_book;
mod get_books;
mod upload_book;

pub_use_hidden!( upload_book => upload_book );
pub_use_hidden!( get_books => get_books, get_book );
pub_use_hidden!( delete_book => delete_book );
pub_use_hidden!( annotations => add_annotation, get_annotations_for_book, get_annotation, delete_annotation );
