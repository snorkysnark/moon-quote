import ePub from "epubjs";
import * as fs from "@tauri-apps/api/fs";
import * as commands from "./commands";

class Library {
    libraryDir: string;

    private constructor(libraryDir: string) {
        this.libraryDir = libraryDir;
    }

    static async load(): Promise<Library> {
        const libraryDir = await commands.libraryDir();
        await fs.createDir(libraryDir, { recursive: true });

        return new Library(libraryDir);
    }

    async uploadBook(bookPath: string) {
        const file = await fs.readBinaryFile(bookPath);
        const book = ePub(file.buffer);

        const metadata = await book.loaded.metadata;
        const cover = await book.archive.getBlob(await book.loaded.cover);
    }
}

export default Library;
