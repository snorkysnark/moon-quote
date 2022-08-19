<script lang="ts">
    import * as fs from "@tauri-apps/api/fs";
    import ePub from "epubjs";

    export let bookPath: string;
    let viewContainer: HTMLElement;

    async function loadBook(viewContainer: HTMLElement, path: string) {
        if (!viewContainer) return;

        const file = await fs.readBinaryFile(path);
        const book = ePub(file.buffer);

        const rendition = book.renderTo(viewContainer, {
            height: "100%",
            width: "100%",
            flow: "scrolled-doc",
            allowScriptedContent: true,
        });
        rendition.display(10);
    }
    $: loadBook(viewContainer, bookPath);
</script>

<div id="reader" bind:this={viewContainer} />

<style>
    #reader {
        width: 100%;
        height: 100%;
    }
</style>
