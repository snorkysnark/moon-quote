<script lang="ts">
    import type { Book, NavItem } from "epubjs";
    import { createEventDispatcher } from "svelte";
    import * as fs from "@tauri-apps/api/fs";
    import ePub from "epubjs";
    import Reader, { type ReaderController } from "./Reader.svelte";
    import ToC from "./ToC.svelte";

    let tocEnabled = false;
    let readerController: ReaderController;
    const dispatch = createEventDispatcher<{ goBack: void }>();

    export let bookPath: string;

    let bookPromise: Promise<Book>;
    async function loadBook(path: string) {
        const file = await fs.readBinaryFile(path);
        const book = ePub(file.buffer);

        await book.ready;
        return book;
    }
    $: bookPromise = loadBook(bookPath);

    function onTocClick(event: CustomEvent<NavItem>) {
        if (readerController) readerController.display(event.detail.href);
    }
</script>

<div class="container">
    <div class="topPanel">
        <button on:click={() => dispatch("goBack")}>&lt-</button>
        <span>Library</span>
    </div>
    <div class="mainView">
        <div class="readerView">
            <button
                class="navButton"
                disabled={!readerController}
                on:click={() => readerController.prev()}>&lt</button
            >
            <div class="readerPage">
                {#await bookPromise}
                    <p>Loading...</p>
                {:then book}
                    <Reader {book} bind:controller={readerController} />
                {/await}
            </div>
            <button
                class="navButton"
                disabled={!readerController}
                on:click={() => readerController.next()}>&gt</button
            >
        </div>
        {#if tocEnabled}
            <div class="toc">
                {#await bookPromise}
                    <p>Loading</p>
                {:then book}
                    <ToC items={book.navigation.toc} on:click={onTocClick} />
                {/await}
            </div>
        {/if}
        <div class="sidePanel">
            <button on:click={() => (tocEnabled = !tocEnabled)}>TOC</button>
        </div>
    </div>
</div>

<style>
    .container {
        display: flex;
        flex-flow: column;
        width: 100%;
        height: 100vh;
    }

    .topPanel {
        background-color: orange;
    }

    .mainView {
        background-color: #e8e8e8;
        flex: 1 1 auto;
        min-height: 0;
        display: flex;
    }

    .sidePanel {
        width: 50px;
    }

    .toc {
        width: 500px;
        min-width: 200px;
        flex: 0 1 auto;
        background-color: lightblue;
        overflow-y: scroll;
    }

    .readerView {
        flex: 1 1 auto;
        height: 100%;
        display: flex;
    }

    .navButton {
        flex: 1 1 auto;
        border: none;
        outline: none;
        background: none;
        margin: 0;
        color: #b8b8b8;
        font-size: 50px;
        user-select: none;
        cursor: pointer;
    }

    .readerPage {
        z-index: 1;
        margin-top: 10px;
        background-color: white;
        width: 800px;
        height: calc(100% - 20px);
        box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
    }
</style>
