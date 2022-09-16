<script lang="ts">
    import LibraryGrid from "./LibraryGrid.svelte";
    import FileDropHandler from "../FileDropHandler.svelte";
    import FileDropSplash from "../FileDropSplash.svelte";
    import { closeMenu } from "../contextmenu";
    import * as backend from "../backend";
    import type { BookDatabaseEntry } from "../backend";
    import * as path from "@tauri-apps/api/path";
    import * as dialog from "@tauri-apps/api/dialog";
    import { Loading, Window, WindowHeader } from "src/decor";

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
</script>

{#if enableFiledrop}
    <FileDropHandler
        bind:hovering
        allowedExtensions={["epub"]}
        on:fileDrop={(e) => uploadBooks(e.detail)}
    />
{/if}

<Window>
    <svelte:fragment slot="top">
        <WindowHeader>Library</WindowHeader>
        <button
            id="addBook"
            disabled={!enableButtons}
            on:click={openBooksDialog}>+</button
        >
    </svelte:fragment>

    <div slot="main" id="library" on:scroll={closeMenu}>
        {#if uploadingBook}
            <Loading message={`Uploading\n${uploadingBook}`} />
        {:else if hovering}
            <FileDropSplash message={"Drag and Drop\nto upload books"} />
        {:else if bookEntries}
            <LibraryGrid
                {bookEntries}
                on:open
                on:delete={(e) => deleteBook(e.detail)}
            />
        {:else}
            <Loading />
        {/if}
    </div>
</Window>

<style>
    #addBook {
        width: 100px;
        font-size: 25px;
    }

    #library {
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        overflow-y: scroll;
        padding: 10px;
    }
</style>
