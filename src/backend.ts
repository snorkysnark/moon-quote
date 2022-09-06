import { invoke } from "@tauri-apps/api";
import type { BinaryFileContents } from "@tauri-apps/api/fs";
import type { PackagingMetadataObject } from "epubjs/types/packaging";
import * as fs from "@tauri-apps/api/fs";
import ePub, { Book } from "epubjs";

export interface BookDatabaseEntry {
    bookId: number;
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

export function deleteBook(bookId: number): Promise<void> {
    return invoke("delete_book", { bookId });
}

export interface EpubCover {
    url: string;
    data: BinaryFileContents;
}

function toArray(data: BinaryFileContents): number[] {
    return Array.from(
        data instanceof ArrayBuffer ? new Uint8Array(data) : data
    );
}

export function uploadBookRaw(
    bookPath: string,
    metadata: PackagingMetadataObject,
    cover?: EpubCover
): Promise<BookDatabaseEntry> {
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

export async function uploadBook(bookPath: string): Promise<BookDatabaseEntry> {
    const file = await fs.readBinaryFile(bookPath);
    const book = ePub(file.buffer);
    const metadata = await book.loaded.metadata;

    const coverUrl = await book.loaded.cover;
    const cover = coverUrl
        ? {
              url: coverUrl,
              data: await (await book.archive.getBlob(coverUrl)).arrayBuffer(),
          }
        : null;

    return await uploadBookRaw(bookPath, metadata, cover);
}

export interface AnnotationDatabaseEntry {
    annotationId: number;
    cfi: string;
    textContent: string;
    color: number;
}

export function getAnnotationsForBook(
    bookId: number
): Promise<AnnotationDatabaseEntry[]> {
    return invoke("get_annotations_for_book", { bookId });
}

export function addAnnotation(
    bookId: number,
    cfi: string,
    textContent: string,
    color: number
): Promise<AnnotationDatabaseEntry> {
    return invoke("add_annotation", { bookId, cfi, textContent, color });
}

export function deleteAnnotation(annotationId: number): Promise<void> {
    return invoke("delete_annotation", { annotationId });
}

export interface LoadedBook {
    entry: BookDatabaseEntry;
    epub: Book;
    annotations: AnnotationDatabaseEntry[];
}

export async function loadBook(entry: BookDatabaseEntry): Promise<LoadedBook> {
    const [file, annotations] = await Promise.all([
        fs.readBinaryFile(entry.epubPath),
        getAnnotationsForBook(entry.bookId),
    ]);
    const epub = ePub(file.buffer);

    await epub.ready;
    return { entry, epub, annotations };
}
