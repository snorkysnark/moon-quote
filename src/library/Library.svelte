<script lang="ts">
    import { asyncReadable } from "@square/svelte-store";
    import { type BookDatabaseEntry, getBooks } from "../backend";
    import Book from "./Book.svelte";
    import * as backend from "src/backend";

    const bookQuery = asyncReadable(null, getBooks);
    let bookList: BookDatabaseEntry[] = [];
    $: if ($bookQuery) {
        bookList = $bookQuery;
    }

    function deleteBook(target: BookDatabaseEntry) {
        bookList = bookList.filter((other) => other.bookId !== target.bookId);
        backend.deleteBook(target.bookId);
    }
</script>

<div class="flex flex-col h-screen select-none">
    <div class="bg-orange-400 h-10 flex pl-1">
        <h1 class="text-2xl font-bold self-center flex-auto cursor-default">
            Library
        </h1>
        <button class="bg-gray-200 px-5">+</button>
    </div>
    <div class="flex-1 overflow-y-scroll">
        <div class="p-2 grid gap-2 grid-cols-fit-40 auto-rows-fr">
            {#each bookList as bookEntry (bookEntry.bookId)}
                <Book {bookEntry} on:delete={() => deleteBook(bookEntry)} />
            {/each}
        </div>
    </div>
</div>
