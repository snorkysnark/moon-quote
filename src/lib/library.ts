import * as fs from "@tauri-apps/api/fs";
import ePub from "epubjs";
import * as commands from "./commands";
import type { BookEntry } from "./data";

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

export function getBooks(): Promise<BookEntry[]> {
    return commands.getBooks();
}
