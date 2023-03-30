mod add_annotation;
mod comment;
mod data;
mod delete_annotation;
mod full_list;
mod get_annotations;

use crate::utils::pub_use_commands;

pub_use_commands!(get_annotations => { get_annotations_for_book, get_annotation });
pub_use_commands!(delete_annotation => { delete_annotation });
pub_use_commands!(add_annotation => { add_annotation });
pub_use_commands!(full_list => { get_annotations_all });
pub_use_commands!(comment => { set_annotation_comment });
pub use data::{Annotation, AnnotationFull};
