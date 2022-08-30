import * as fs from "@tauri-apps/api/fs";
import ePub from "epubjs";
import * as commands from "./library/commands";
import type { BookEntry } from "./library/data";

export async function uploadBook(bookPath: string): Promise<BookEntry> {
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

    return await commands.uploadBook(bookPath, metadata, cover);
}

export async function getBooks(): Promise<{ [id: number]: BookEntry }> {
    const bookEntries = {};
    for (const bookEntry of await commands.getBooks()) {
        bookEntries[bookEntry.bookId] = bookEntry;
    }
    return bookEntries;
}

export { deleteBook } from "./library/commands";
export type { BookEntry };
