use std::error::Error as StdError;

use anyhow::Result;
use serde::{Serialize, Serializer};

pub struct SerializableError {
    error: anyhow::Error,
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

pub type SerializableResult<T, E = SerializableError> = Result<T, E>;
