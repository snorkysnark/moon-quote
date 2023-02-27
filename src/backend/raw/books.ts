import { invoke } from "@tauri-apps/api";
import { PackagingMetadataObject } from "epubjs/types/packaging";

export interface BookEntry {
    bookId: string;
    epubPath: string;
    coverPath: string;
    metadata: PackagingMetadataObject;
}

export function getBooks(): Promise<BookEntry[]> {
    return invoke("plugin:library|get_books");
}

export function uploadBook(
    bookPath: string,
    metadata: PackagingMetadataObject,
    cover?: { url: string; data: Uint8Array }
): Promise<BookEntry> {
    return invoke("plugin:library|upload_book", { bookPath, metadata, cover });
}

export function deleteBook(bookId: string): Promise<void> {
    return invoke("plugin:library|delete_book", { bookId });
}
