use std::sync::Mutex;

use tauri::State;

use super::target::TargetLoaded;
use crate::error::{sanyhow, SerializableResult};

pub(super) struct InitialTarget {
    initial_target: Mutex<Option<TargetLoaded>>,
}

impl From<Option<TargetLoaded>> for InitialTarget {
    fn from(initial_target: Option<TargetLoaded>) -> Self {
        Self {
            initial_target: Mutex::new(initial_target),
        }
    }
}

// Returns initial url the first time, then returns None
#[tauri::command]
pub(super) fn initial_target(
    state: State<InitialTarget>,
) -> SerializableResult<Option<TargetLoaded>> {
    let mut target = state
        .initial_target
        .lock()
        .map_err(|err| sanyhow!("{err}"))?;
    Ok(target.take())
}
