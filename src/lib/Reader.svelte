<script lang="ts">
    import * as fs from "@tauri-apps/api/fs";
    import ePub from "epubjs";
    import { asyncOnMount } from "./utils";

    export let bookPath: string;

    const mounted = asyncOnMount();
    let viewContainer: HTMLElement;

    async function loadBook(path: string) {
        const file = await fs.readBinaryFile(path);
        const book = ePub(file.buffer);

        await mounted;
        const rendition = book.renderTo(viewContainer, {
            height: "100%",
            width: "100%",
            allowScriptedContent: true,
        });
        rendition.display(10);
    }
    $: loadBook(bookPath);
</script>

<div id="reader" bind:this={viewContainer} />

<style>
    #reader {
        width: 500px;
        height: 500px;
    }
</style>
