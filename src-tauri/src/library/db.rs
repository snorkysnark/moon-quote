use std::path::Path;

use anyhow::{anyhow, Result};
use diesel::{
    r2d2::{ConnectionManager, Pool},
    SqliteConnection,
};
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};

const MIGRATIONS: EmbeddedMigrations = embed_migrations!("../migrations");
pub type SqlitePool = Pool<ConnectionManager<SqliteConnection>>;

pub fn init_database(db_path: &Path) -> Result<SqlitePool> {
    let sqlite_manager: ConnectionManager<SqliteConnection> = ConnectionManager::new(
        db_path
            .to_str()
            .ok_or_else(|| anyhow!("Database path is not a valid string"))?,
    );
    let sqlite_pool = Pool::new(sqlite_manager)?;

    sqlite_pool
        .get()?
        .run_pending_migrations(MIGRATIONS)
        .map_err(|err| anyhow!("{err}"))?;
    Ok(sqlite_pool)
}
