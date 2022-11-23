import { invoke } from "@tauri-apps/api";
import type { BinaryFileContents } from "@tauri-apps/api/fs";
import type { PackagingMetadataObject } from "epubjs/types/packaging";
import * as fs from "@tauri-apps/api/fs";
import ePub, { Book } from "epubjs";
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

    await book.ready;
    return book;
}

export interface AnnotationDatabaseEntry {
    bookId: string;
    cfi: string;
    textContent: string;
    color: number;
}

export async function getAnnotationsForBook(
    bookId: string
): Promise<AnnotationDatabaseEntry[]> {
    const annotations: AnnotationDatabaseEntry[] = await invoke(
        "get_annotations_for_book",
        { bookId }
    );
    sortAnnotations(annotations);
    return annotations;
}
