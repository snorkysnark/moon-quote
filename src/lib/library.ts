import * as path from "@tauri-apps/api/path";
import * as fs from "@tauri-apps/api/fs";
import * as commands from "./commands";
import filenamify from "filenamify";
import ePub from "epubjs";
import type { PackagingMetadataObject } from "epubjs/types/packaging";

class BookContainer {
    containerDir: string;

    bookPath?: string;
    coverPath?: string;
    metadataPath?: string;
    metadata?: PackagingMetadataObject;

    constructor(containerDir: string) {
        this.containerDir = containerDir;
    }

    async uploadBook(bookPath: string) {
        if (this.bookPath) {
            throw "book is already uploaded";
        }

        const newBookPath = await path.join(this.containerDir, "book.epub");
        await fs.copyFile(bookPath, newBookPath);
        this.bookPath = newBookPath;
    }

    async uploadMetadata(metadata: PackagingMetadataObject) {
        if (this.metadataPath) {
            throw "metadata is already uploaded";
        }

        const metadataPath = await path.join(
            this.containerDir,
            "metadata.json"
        );
        await fs.writeTextFile(metadataPath, JSON.stringify(metadata, null, 4));

        this.metadataPath = metadataPath;
        this.metadata = metadata;
    }

    async uploadCover(cover: Blob) {
        if (this.coverPath) {
            throw "cover is already uploaded";
        }

        const coverPath = await path.join(this.containerDir, "cover.jpg");
        await fs.writeBinaryFile(coverPath, await cover.arrayBuffer());

        this.coverPath = coverPath;
    }
}

class Library {
    libraryDir: string;
    containers: BookContainer[];

    private constructor(libraryDir: string, containers: BookContainer[]) {
        this.libraryDir = libraryDir;
        this.containers = containers;
    }

    static async load(): Promise<Library> {
        const libraryDir = await commands.libraryDir();
        await fs.createDir(libraryDir, { recursive: true });

        const containers = [];
        for (const entry of await fs.readDir(libraryDir)) {
            if (await commands.isDir(entry.path)) {
                containers.push(new BookContainer(entry.path));
            }
        }

        return new Library(libraryDir, containers);
    }

    private async addContainer(name: string): Promise<BookContainer> {
        const safeName = filenamify(name);
        const containerPath = await path.join(this.libraryDir, safeName);

        await fs.createDir(containerPath);
        return new BookContainer(containerPath);
    }

    async uploadBook(bookPath: string) {
        const file = await fs.readBinaryFile(bookPath);
        const book = ePub(file.buffer);

        const metadata = await book.loaded.metadata;
        const cover = await book.archive.getBlob(await book.loaded.cover);
        const container = await this.addContainer(metadata.title);

        await container.uploadBook(bookPath);
        await container.uploadMetadata(metadata);
        await container.uploadCover(cover);
    }
}

export default Library;
