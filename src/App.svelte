<script lang="ts">
    import { asyncReadable } from "@square/svelte-store";
    import { getBooks } from "./backend";
    import type { BookDatabaseEntry } from "./backend/library";

    const bookQuery = asyncReadable(null, getBooks);
    let bookList: BookDatabaseEntry[] = [];
    $: if ($bookQuery) {
        bookList = $bookQuery;
    }
</script>

<div class="flex flex-col h-screen">
    <div class="bg-orange-400 h-10" />
    <div class="flex-1">
        <div class="p-4 grid gap-4 grid-cols-fit-40 auto-rows-fr">
            {#each bookList as book (book.bookId)}
                <button class="bg-cyan-200">{book.metaTitle}</button>
            {/each}
        </div>
    </div>
</div>
