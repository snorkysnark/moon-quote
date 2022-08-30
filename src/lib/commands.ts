import type { BinaryFileContents } from "@tauri-apps/api/fs";
import { invoke } from "@tauri-apps/api/tauri";
import type { PackagingMetadataObject } from "epubjs/types/packaging";
import type { BookEntry } from "./data";

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
