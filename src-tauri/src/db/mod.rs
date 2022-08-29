use std::path::Path;

use diesel::{
    r2d2::{ConnectionManager, Pool},
    SqliteConnection,
};
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};

pub mod schema;

pub type SqlitePool = Pool<ConnectionManager<SqliteConnection>>;

const MIGRATIONS: EmbeddedMigrations = embed_migrations!("../migrations");

pub fn init_db(db_path: &Path) -> SqlitePool {
    let sqlite_manager: ConnectionManager<SqliteConnection> =
        ConnectionManager::new(db_path.to_str().expect("Sqlite initialization error"));

    let sqlite_pool = Pool::new(sqlite_manager).expect("Pool initialization error");

    sqlite_pool
        .get()
        .expect("Can't connect to sqlite database")
        .run_pending_migrations(MIGRATIONS)
        .expect("Error running migrations");

    sqlite_pool
}
