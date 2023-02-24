mod data;
mod delete_annotation;
mod get_annotations;
mod add_annotation;
mod full_list;

use crate::utils::pub_use_commands;

pub_use_commands!(get_annotations => { get_annotations_for_book, get_annotation });
pub_use_commands!(delete_annotation => { delete_annotation });
pub_use_commands!(add_annotation => { add_annotation });
pub_use_commands!(full_list => { get_annotations_all });
pub use data::{Annotation, AnnotationFull};
