// #[tauri::command] macro adds hidden exports to the module, so we have to reexport them
macro_rules! pub_use_hidden {
    ($module:path => $($command:ident),+)  => {
        ::paste::paste!{
            pub use $module::{$($command, [< __cmd__ $command >]),+};
        }
    }
}

mod data;
mod upload_book;
mod get_books;

pub_use_hidden!( upload_book => upload_book );
pub_use_hidden!( get_books => get_books );
