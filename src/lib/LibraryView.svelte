<script lang="ts">
    import * as dialog from "@tauri-apps/api/dialog";
    import * as path from "@tauri-apps/api/path";
    import * as library from "./library";
    import type { BookEntry } from "./library";
    import LibraryBook from "./LibraryBook.svelte";
    import { createEventDispatcher } from "svelte";

    let uploadingBookName: string = null;
    let booksById: { [id: number]: BookEntry } = {};

    const dispatch = createEventDispatcher<{ openBook: BookEntry }>();

    async function loadBooks() {
        const newBooks = await library.getBooks();
        booksById = { ...booksById, ...newBooks };
    }
    loadBooks();

    async function addBookDialog() {
        let selected = await dialog.open({
            multiple: true,
            filters: [{ name: "Epub", extensions: ["epub"] }],
        });
        if (selected === null) return;

        const bookPaths = Array.isArray(selected) ? selected : [selected];
        try {
            for (const bookPath of bookPaths) {
                uploadingBookName = await path.basename(bookPath);
                const bookEntry = await library.uploadBook(bookPath);

                booksById = { ...booksById, [bookEntry.bookId]: bookEntry };
            }
        } finally {
            uploadingBookName = null;
        }
    }

    function deleteBook(bookId: number) {
        delete booksById[bookId];
        booksById = booksById;

        library.deleteBook(bookId);
    }

    function openBook(bookEntry: BookEntry) {
        dispatch("openBook", bookEntry);
    }
</script>

<div class="container">
    <div class="topPanel">
        <span>Library</span>
    </div>
    <div class="mainView">
        {#if uploadingBookName}
            <p class="overlay">Uploading {uploadingBookName}</p>
        {/if}
        <div
            class="libraryGrid"
            style={`pointer-events: ${uploadingBookName ? "none" : "auto"};`}
        >
            {#each Object.values(booksById) as book}
                <LibraryBook
                    {book}
                    on:click={() => openBook(book)}
                    on:delete={() => deleteBook(book.bookId)}
                />
            {/each}
            <button class="addBook" on:click={addBookDialog}>+</button>
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
        flex: 1 1 auto;
        min-height: 0;
    }

    .libraryGrid {
        display: grid;
        gap: 10px;
        grid-template-columns: repeat(auto-fit, 200px);
        grid-auto-rows: minmax(250px, content-fit);
        align-items: center;
        justify-items: center;
        overflow-y: scroll;
    }

    .addBook {
        cursor: pointer;
        width: 50px;
        height: 50px;
    }

    .overlay {
        margin: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.2);
        text-align: center;
    }
</style>
