<script lang="ts">
    /* import Library from "./library"; */
    /* import FileDrop from "./FileDrop.svelte"; */
    import * as dialog from "@tauri-apps/api/dialog";
    import * as fs from "@tauri-apps/api/fs";
    import ePub from "epubjs";
    import { uploadBook } from "./commands";
    /* import { createEventDispatcher } from "svelte"; */

    /* const dispatch = createEventDispatcher<{ openBook: string }>(); */
    /* const libraryPromise = Library.load(); */

    async function addBookDialog() {
        let selected = await dialog.open({
            multiple: true,
            filters: [{ name: "Epub", extensions: ["epub"] }],
        });
        if (Array.isArray(selected)) selected = selected[0];

        const file = await fs.readBinaryFile(selected);
        const book = ePub(file.buffer);
        const metadata = await book.loaded.metadata;

        const coverUrl = await book.loaded.cover;
        const coverBlob = await book.archive.getBlob(coverUrl);
        const coverData = new Uint8Array(await coverBlob.arrayBuffer());

        uploadBook(selected, metadata, coverUrl, coverData);
    }
</script>

<div class="container">
    <div class="topPanel">
        <span>Library</span>
    </div>
    <div class="mainView">
        <button on:click={addBookDialog}>+</button>
    </div>
</div>

<style>
    .container {
        display: flex;
        flex-flow: column;
        width: 100%;
        height: 100vh;
    }

    .mainView {
        flex: 1 1 auto;
        min-height: 0;
    }

    .topPanel {
        background-color: orange;
    }
</style>
