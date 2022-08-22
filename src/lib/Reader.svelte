<script lang="ts" context="module">
    export interface ReaderController {
        next: () => Promise<void>;
        prev: () => Promise<void>;
    }
</script>

<script lang="ts">
    import * as fs from "@tauri-apps/api/fs";
    import ePub, { Book, Rendition } from "epubjs";

    export let bookPath: string;

    let book: Book;
    let viewContainer: HTMLElement;
    let rendition: Rendition;

    export const controller: ReaderController = {
        next: async () => {
            if (rendition) await rendition.next();
        },
        prev: async () => {
            if (rendition) await rendition.prev();
        },
    };

    async function loadBook(path: string) {
        const file = await fs.readBinaryFile(path);
        book = ePub(file.buffer);
    }
    $: loadBook(bookPath);

    function renderBook(container: HTMLElement, book: Book) {
        if (rendition) rendition.destroy();

        rendition = book.renderTo(container, {
            height: "100%",
            width: "100%",
            flow: "scrolled-doc",
            allowScriptedContent: true,
        });

        rendition.display(0);
    }
    $: if (viewContainer && book) renderBook(viewContainer, book);
</script>

<div id="reader" bind:this={viewContainer} />

<style>
    #reader {
        width: 100%;
        height: 100%;
    }
</style>
