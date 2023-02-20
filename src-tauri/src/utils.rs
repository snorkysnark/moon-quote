// #[tauri::command] macro adds hidden exports to the module, so we have to reexport them
macro_rules! pub_use_commands {
    ($module:path => { $($command:ident),+ })  => {
        ::paste::paste!{
            pub use $module::{$($command, [< __cmd__ $command >]),+};
        }
    };
}

// When creating constants that are tuples of diesel columns,
// their type is the same as the value
macro_rules! const_columns {
    ($name:ident, $columns:tt) => {
        const $name: $columns = $columns;
    };
}

pub(crate) use {const_columns, pub_use_commands};
