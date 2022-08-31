<script lang="ts">
    import type { BookEntry } from "./lib/library";
    import LibraryView from "./lib/LibraryView.svelte";
    import ReaderView from "./lib/ReaderView.svelte";

    let currentBook: BookEntry = null;
</script>

<main>
    {#if currentBook === null}
        <LibraryView on:openBook={(event) => (currentBook = event.detail)} />
    {:else}
        <ReaderView
            bookEntry={currentBook}
            on:goBack={() => (currentBook = null)}
        />
    {/if}
</main>
