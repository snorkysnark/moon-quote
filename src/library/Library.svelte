<script lang="ts">
    import { asyncReadable } from "@square/svelte-store";
    import { type BookDatabaseEntry, getBooks } from "../backend";
    import Book from "./Book.svelte";
    import * as backend from "src/backend";
    import * as path from "@tauri-apps/api/path";
    import * as dialog from "@tauri-apps/api/dialog";
    import Loading from "src/decor/Loading.svelte";

    const bookQuery = asyncReadable(null, getBooks);
    let bookList: BookDatabaseEntry[] = null;
    $: if ($bookQuery) {
        bookList = $bookQuery;
    }

    function deleteBook(target: BookDatabaseEntry) {
        bookList = bookList.filter((other) => other.bookId !== target.bookId);
        backend.deleteBook(target.bookId);
    }

    let hovering: boolean = false;
    let uploadingBook: string = null;

    async function uploadBooks(bookPaths: string[]) {
        for (const bookPath of bookPaths) {
            try {
                uploadingBook = await path.basename(bookPath);
                const newBook = await backend.uploadBook(bookPath);
                bookList = [...bookList, newBook];
            } catch (error) {
                console.error(error);
            }
        }
        uploadingBook = null;
    }

    async function openUploadDialog() {
        let bookPaths = await dialog.open({
            multiple: true,
            filters: [{ name: "Epub", extensions: ["epub"] }],
        });
        if (bookPaths) {
            uploadBooks(Array.isArray(bookPaths) ? bookPaths : [bookPaths]);
        }
    }

    let enableFiledrop: boolean;
    $: enableFiledrop = bookList !== null && uploadingBook === null;

    let enableButtons: boolean;
    $: enableButtons = bookList !== null && uploadingBook === null && !hovering;
</script>

<div class="flex flex-col h-screen select-none">
    <div class="bg-orange-400 h-10 flex pl-1">
        <h1 class="text-2xl font-bold self-center flex-auto cursor-default">
            Library
        </h1>
        <button
            class="bg-gray-200 w-12 text-3xl disabled:text-gray-400"
            disabled={!enableButtons}
            on:click={openUploadDialog}>+</button
        >
    </div>
    <div class="flex-1 overflow-y-scroll">
        {#if uploadingBook}
            <Loading message={`Uploading\n${uploadingBook}`} />
        {:else if hovering}{:else if bookList}
            <div class="p-2 grid gap-2 grid-cols-fit-40 auto-rows-fr">
                {#each bookList as bookEntry (bookEntry.bookId)}
                    <Book {bookEntry} on:delete={() => deleteBook(bookEntry)} />
                {/each}
            </div>
        {:else}
            <Loading />
        {/if}
    </div>
</div>
