use std::{fs, io, path::Path};

use include_dir::{include_dir, Dir};

static DEFAULT_SCRIPTS: Dir<'_> = include_dir!("$CARGO_MANIFEST_DIR/exporters");

pub fn create_exporters_dir(path: &Path) -> io::Result<()> {
    if !path.exists() {
        fs::create_dir_all(path)?;
        DEFAULT_SCRIPTS.extract(path)?;
    }
    Ok(())
}
