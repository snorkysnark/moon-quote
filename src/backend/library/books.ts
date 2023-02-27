import ePub, { Book } from "epubjs";
import { readBinaryFile } from "@tauri-apps/api/fs";
import { BookEntry, uploadBook as uploadBookRaw } from "./raw/books";

export { getBooks, deleteBook } from "./raw/books";
export type { BookEntry } from "./raw/books";

export async function uploadBook(bookPath: string): Promise<BookEntry> {
    const file = await readBinaryFile(bookPath);
    const book = ePub(file.buffer);
    const metadata = await book.loaded.metadata;

    const coverUrl = await book.loaded.cover;
    const cover = coverUrl
        ? {
              url: coverUrl,
              data: new Uint8Array(
                  await (await book.archive.getBlob(coverUrl)).arrayBuffer()
              ),
          }
        : null;

    return await uploadBookRaw(bookPath, metadata, cover);
}

export async function loadEpub(path: string): Promise<Book> {
    const file = await readBinaryFile(path);
    const book = ePub(file.buffer);

    await book.opened;
    return book;
}
