<script lang="ts">
    import Loading from "../Loading.svelte";
    import LibraryGrid from "./LibraryGrid.svelte";
    import FileDropHandler from "../FileDropHandler.svelte";
    import FileDropSplash from "../FileDropSplash.svelte";
    import { closeMenu } from "../contextmenu";
    import * as backend from "../backend";
    import type { BookDatabaseEntry } from "../backend";
    import * as path from "@tauri-apps/api/path";

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

    let enableFiledrop: boolean;
    $: enableFiledrop = bookEntries !== null && uploadingBook === null;

    let enableButtons: boolean;
    $: enableButtons =
        bookEntries !== null && uploadingBook === null && !hovering;
</script>

{#if enableFiledrop}
    <FileDropHandler
        bind:hovering
        extensionFilter={["epub"]}
        on:fileDrop={(e) => console.log(e.detail)}
    />
{/if}

<main>
    <div id="topPanel">
        <h1>Library</h1>
        <button id="addBook" disabled={!enableButtons}>+</button>
    </div>
    <div id="library" on:scroll={closeMenu}>
        {#if uploadingBook}
            <Loading message={uploadingBook} />
        {:else if hovering}
            <FileDropSplash message={"Drag and Drop\nto upload books"} />
        {:else if bookEntries}
            <LibraryGrid
                {bookEntries}
                on:delete={(e) => deleteBook(e.detail)}
            />
        {:else}
            <Loading />
        {/if}
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
        height: 50px;
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
