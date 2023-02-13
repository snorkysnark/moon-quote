import { invoke } from "@tauri-apps/api";
import type { BinaryFileContents } from "@tauri-apps/api/fs";
import type { PackagingMetadataObject } from "epubjs/types/packaging";
import * as fs from "@tauri-apps/api/fs";
import ePub, { Book, EpubCFI } from "epubjs";
import { sortAnnotations } from "src/util/cfi";

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

interface EpubCover {
    url: string;
    data: BinaryFileContents;
}

function toArray(data: BinaryFileContents): number[] {
    return Array.from(
        data instanceof ArrayBuffer ? new Uint8Array(data) : data
    );
}

function uploadBookRaw(
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

export async function loadEpub(path: string): Promise<Book> {
    const file = await fs.readBinaryFile(path);
    const book = ePub(file.buffer);

    await book.opened;
    return book;
}

export interface AnnotationRaw {
    bookId: string;
    cfi: string;
    textContent: string;
    color: string;
    comment: string;
    collapsed: boolean;
}

export interface AnnotationEntry {
    bookId: string;
    cfi: EpubCFI;
    textContent: string;
    color: string;
    comment: string;
    collapsed: boolean;
}

export async function getAnnotationsForBookRaw(
    bookId: string
): Promise<AnnotationRaw[]> {
    return invoke("get_annotations_for_book", { bookId });
}

export async function getAnnotationsForBook(
    bookId: string
): Promise<AnnotationEntry[]> {
    return sortAnnotations(
        (await getAnnotationsForBookRaw(bookId)).map((annotation) => ({
            ...annotation,
            cfi: new EpubCFI(annotation.cfi),
        }))
    );
}

export async function addAnnotationRaw(
    annotation: AnnotationRaw
): Promise<void> {
    return invoke("add_annotation", { annotation });
}

export async function addAnnotation(
    annotation: AnnotationEntry
): Promise<void> {
    return invoke("add_annotation", {
        annotation: {
            ...annotation,
            cfi: annotation.cfi.toString(),
        },
    });
}

export async function deleteAnnotationRaw(bookId: string, cfi: string) {
    return invoke("delete_annotation", { bookId, cfi });
}

export async function deleteAnnotation(bookId: string, cfi: EpubCFI) {
    return invoke("delete_annotation", { bookId, cfi: cfi.toString() });
}

export interface AnnotationFull {
    bookId: string;
    metaTitle: string;
    metaCreator: string;
    cfi: string;
    textContent: string;
    color: string;
    comment: string;
    collapsed: boolean;
}

export async function getAnnotationsAll(): Promise<AnnotationFull[]> {
    return invoke("get_annotations_all");
}
