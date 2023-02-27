import { invoke } from "@tauri-apps/api";
import { BookEntry } from "./books";

export interface AnnotationData {
    bookId: string;
    cfi: string;
    textContent: string;
    color: string;
    comment: string;
    collapsed: boolean;
}

export interface AnnotationEntry extends AnnotationData {
    annotationId: number;
}


export interface AnnotationFull {
    book: BookEntry;
    annotation: AnnotationEntry;
}

export function getAnnotationsForBook(bookId: string): Promise<AnnotationEntry[]> {
    return invoke("plugin:library|get_annotations_for_book", { bookId });
}

export function getAnnotationsAll(): Promise<AnnotationFull[]> {
    return invoke("plugin:library|get_annotations_all");
}

export function addAnnotation(data: AnnotationData): Promise<AnnotationEntry> {
    return invoke("plugin:library|add_annotation", { data });
}

export function deleteAnnotation(annotationId: number): Promise<void> {
    return invoke("plugin:library|delete_annotation", { annotationId });
}
