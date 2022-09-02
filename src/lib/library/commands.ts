import type { BinaryFileContents } from "@tauri-apps/api/fs";
import { invoke } from "@tauri-apps/api/tauri";
import type { PackagingMetadataObject } from "epubjs/types/packaging";
import type { BookEntry, AnnotationEntry } from "./data";

export interface EpubCover {
    url: string;
    data: BinaryFileContents;
}

function toArray(data: BinaryFileContents): number[] {
    return Array.from(
        data instanceof ArrayBuffer ? new Uint8Array(data) : data
    );
}

export function uploadBook(
    bookPath: string,
    metadata: PackagingMetadataObject,
    cover?: EpubCover
): Promise<BookEntry> {
    return invoke("upload_book", {
        bookPath,
        metadata,
        cover: cover
            ? {
                  url: cover.url,
                  data: toArray(cover.data),
              }
            : null,
    });
}

export function getBooks(): Promise<BookEntry[]> {
    return invoke("get_books");
}

export function deleteBook(bookId: number): Promise<void> {
    return invoke("delete_book", { idToDelete: bookId });
}

export function addAnnotation(
    bookId: number,
    cfi: string,
    textContent: string
): Promise<number> {
    return invoke("add_annotation", { bookId, cfi, textContent });
}

export function getAnnotationsForBook(
    bookId: number
): Promise<AnnotationEntry[]> {
    return invoke("get_annotations_for_book", { bookId });
}

export function deleteAnnotation(annotationId: number): Promise<void> {
    return invoke("delete_annotation", { annotationId });
}
