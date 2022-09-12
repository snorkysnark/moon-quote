<script lang="ts">
    import Loading from "../Loading.svelte";
    import LibraryGrid from "./LibraryGrid.svelte";
    import FileDropHandler from "../FileDropHandler.svelte";
    import FileDropSplash from "../FileDropSplash.svelte";
    import { closeMenu } from "../contextmenu";
    import * as backend from "../backend";
    import type { BookDatabaseEntry } from "../backend";
    import * as path from "@tauri-apps/api/path";
    import * as dialog from "@tauri-apps/api/dialog";

    let bookEntries: BookDatabaseEntry[] = null;
    backend.getBooks().then((result) => (bookEntries = result));

    let hovering: boolean = false;
    let uploadingBook: string = null;

    function deleteBook(target: BookDatabaseEntry) {
        bookEntries = bookEntries.filter(
            (other) => other.bookId != target.bookId
        );
        backend.deleteBook(target.bookId);
    }

    async function uploadBooks(bookPaths: string[]) {
        try {
            for (const bookPath of bookPaths) {
                uploadingBook = await path.basename(bookPath);
                const newBook = await backend.uploadBook(bookPath);
                bookEntries = [...bookEntries, newBook];
            }
        } finally {
            uploadingBook = null;
        }
    }

    async function openBooksDialog() {
        let bookPaths = await dialog.open({
            multiple: true,
            filters: [{ name: "Epub", extensions: ["epub"] }],
        });
        if (bookPaths) {
            uploadBooks(Array.isArray(bookPaths) ? bookPaths : [bookPaths]);
        }
    }

    let enableFiledrop: boolean;
    $: enableFiledrop = bookEntries !== null && uploadingBook === null;

    let enableButtons: boolean;
    $: enableButtons =
        bookEntries !== null && uploadingBook === null && !hovering;

    const urlArg = backend.urlArg();
</script>

{#if enableFiledrop}
    <FileDropHandler
        bind:hovering
        allowedExtensions={["epub"]}
        on:fileDrop={(e) => uploadBooks(e.detail)}
    />
{/if}

<main>
    <div id="topPanel">
        <h1>Library</h1>
        <button
            id="addBook"
            disabled={!enableButtons}
            on:click={openBooksDialog}>+</button
        >
    </div>
    <div id="library" on:scroll={closeMenu}>
        {#await urlArg then urlArg}
            {urlArg}
        {/await}
    </div>
</main>

<style>
    main {
        display: flex;
        flex-flow: column;
        width: 100%;
        height: 100vh;

        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }

    #topPanel {
        max-height: 50px;
        background-color: orange;
        display: flex;
        padding-left: 5px;
        padding-right: 5px;
    }

    h1 {
        margin: 0;
        flex: 1 1 auto;
    }

    #addBook {
        width: 100px;
        font-size: 25px;
    }

    #library {
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: scroll;
        padding: 10px;
    }
</style>
