import * as path from "@tauri-apps/api/path";
import * as fs from "@tauri-apps/api/fs";
import { appDataDir } from "./commands";

type NamedBooks = { [key: string]: string };

class Library {
    libraryDir: string;
    books: NamedBooks;

    private constructor(libraryDir: string, books: NamedBooks) {
        this.libraryDir = libraryDir;
        this.books = books;
    }

    static async load(): Promise<Library> {
        const libraryDir = await path.join(await appDataDir(), "library");
        await fs.createDir(libraryDir, { recursive: true });

        const books = {};
        for (const entry of await fs.readDir(libraryDir)) {
            if (entry.name && entry.name.endsWith(".epub")) {
                books[entry.name] = entry.path;
            }
        }

        return new Library(libraryDir, books);
    }

    async uploadBook(bookPath: string) {
        const bookName = await path.basename(bookPath);

        if (!(bookName in this.books)) {
            const newBookPath = await path.join(this.libraryDir, bookName);
            await fs.copyFile(bookPath, newBookPath);

            this.books[bookName] = newBookPath;
        }
    }

    getBookNames() {
        return Object.keys(this.books);
    }

    getBookPath(bookName: string) {
        return this.books[bookName];
    }
}

export default Library;
