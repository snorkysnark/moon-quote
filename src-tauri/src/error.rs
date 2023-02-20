use std::error::Error as StdError;

use anyhow::Result;
use serde::{Serialize, Serializer};

// A serializable wrapper around anyhow::Error
pub struct SerializableError {
    error: anyhow::Error,
}

impl SerializableError {
    pub fn new(error: anyhow::Error) -> Self {
        Self { error }
    }
}

impl<E> From<E> for SerializableError
where
    E: StdError + Send + Sync + 'static,
{
    fn from(error: E) -> Self {
        Self {
            error: anyhow::Error::from(error),
        }
    }
}

impl Serialize for SerializableError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(&self.error.to_string())
    }
}

// Serializable version of anyhow::Result
pub type SerializableResult<T, E = SerializableError> = Result<T, E>;

impl From<SerializableError> for anyhow::Error {
    fn from(serr: SerializableError) -> Self {
        serr.error
    }
}

// Serializable version of anyhow::anyhow!
macro_rules! sanyhow {
    ($($args:tt),+) => {
        crate::error::SerializableError::new(::anyhow::anyhow!($($args),+))
    };
}

pub(crate) use sanyhow;
