use std::{fs, io, path::Path};

use include_dir::{include_dir, Dir};

static DEFAULT_TEMPLATES: Dir<'_> = include_dir!("$CARGO_MANIFEST_DIR/xslt");

pub fn create_templates_dir(path: &Path) -> io::Result<()> {
    if !path.exists() {
        fs::create_dir_all(path)?;
        DEFAULT_TEMPLATES.extract(path)?;
    }
    Ok(())
}
