// #[tauri::command] macro adds hidden exports to the module, so we have to reexport them
macro_rules! pub_use_commands {
    ($module:path => { $($command:ident),+ })  => {
        ::paste::paste!{
            pub use $module::{$($command, [< __cmd__ $command >]),+};
        }
    };
}

pub(crate) use pub_use_commands;