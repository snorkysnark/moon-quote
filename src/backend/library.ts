import { invoke } from "@tauri-apps/api";

export interface BookDatabaseEntry {
    bookId: string;
    epubPath: string;
    coverPath: string;
    metaTitle: string;
    metaCreator: string;
    metaDescription: string;
    metaPubdate: string;
    metaPublisher: string;
    metaIdentifier: string;
    metaLanguage: string;
    metaRights: string;
    metaModified_date: string;
    metaLayout: string;
    metaOrientation: string;
    metaFlow: string;
    metaViewport: string;
    metaSpread: string;
}

export function getBooks(): Promise<BookDatabaseEntry[]> {
    return invoke("get_books");
}

export function getBook(bookId: string): Promise<BookDatabaseEntry> {
    return invoke("get_book", { bookId });
}

export function deleteBook(bookId: string): Promise<void> {
    return invoke("delete_book", { bookId });
}
