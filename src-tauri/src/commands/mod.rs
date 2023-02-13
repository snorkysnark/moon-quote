mod open_folder;
mod search;

// #[tauri::command] macro adds hidden exports to the module, so we have to reexport them
macro_rules! pub_use_hidden {
    ($module:path => $($command:ident),+)  => {
        pub_use_hidden!( $module => { $($command),+ } );
    };
    ($module:path => { $($command:ident),+ })  => {
        ::paste::paste!{
            pub use $module::{$($command, [< __cmd__ $command >]),+};
        }
    };
}

pub(crate) use pub_use_hidden;
pub_use_hidden!( open_folder => open_folder );
pub_use_hidden!( search => open_search );
