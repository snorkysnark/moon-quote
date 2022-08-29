import * as fs from "@tauri-apps/api/fs";
import ePub from "epubjs";
import * as commands from "./commands";

export async function uploadBook(bookPath: string): Promise<number> {
    const file = await fs.readBinaryFile(bookPath);
    const book = ePub(file.buffer);
    const metadata = await book.loaded.metadata;

    const coverUrl = await book.loaded.cover;
    const coverBlob = await book.archive.getBlob(coverUrl);

    return await commands.uploadBook(
        bookPath,
        metadata,
        coverUrl,
        await coverBlob.arrayBuffer()
    );
}
