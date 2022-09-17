import { invoke } from "@tauri-apps/api";
import type { BinaryFileContents } from "@tauri-apps/api/fs";
import type { PackagingMetadataObject } from "epubjs/types/packaging";
import * as fs from "@tauri-apps/api/fs";
import ePub, { Book } from "epubjs";
import { sortAnnotations } from "./utils";

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

export function getBook(bookId: number): Promise<BookDatabaseEntry> {
    return invoke("get_book", { bookId });
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
    bookId: number;
    cfi: string;
    textContent: string;
    color: number;
}

export async function getAnnotationsForBook(
    bookId: number
): Promise<AnnotationDatabaseEntry[]> {
    const annotations: AnnotationDatabaseEntry[] = await invoke(
        "get_annotations_for_book",
        { bookId }
    );
    sortAnnotations(annotations);
    return annotations;
}

export function getAnnotation(
    annotationId: number
): Promise<AnnotationDatabaseEntry> {
    return invoke("get_annotation", { annotationId });
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

export async function loadEpub(entry: BookDatabaseEntry): Promise<Book> {
    const file = await fs.readBinaryFile(entry.epubPath);
    const book = ePub(file.buffer);

    await book.ready;
    return book;
}
