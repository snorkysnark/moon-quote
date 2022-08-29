mod query;
mod library;

use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;

type Db = Pool<SqliteConnectionManager>;

// #[tauri::command] macro adds hidden exports to the module, so we have to reexport them
macro_rules! pub_use_hidden {
    ($module:path => $($command:ident),+)  => {
        ::paste::paste!{
            pub use $module::{$($command, [< __cmd__ $command >]),+};
        }
    }
}

pub_use_hidden! { query => db_execute, db_execute_named, db_query, db_query_named  }
pub_use_hidden! { library => upload_book  }
