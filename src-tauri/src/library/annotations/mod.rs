mod data;
mod delete_annotation;
mod get_annotations;
mod add_annotation;

use crate::utils::pub_use_commands;

pub_use_commands!(get_annotations => { get_annotations_for_book, get_annotation });
pub_use_commands!(delete_annotation => { delete_annotation });
pub_use_commands!(add_annotation => { add_annotation });
