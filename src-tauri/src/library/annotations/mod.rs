mod data;
mod delete_annotation;
mod get_annotations;

use crate::utils::pub_use_commands;

pub_use_commands!(get_annotations => { get_annotations_for_book, get_annotation });
pub_use_commands!(delete_annotation => { delete_annotation });
