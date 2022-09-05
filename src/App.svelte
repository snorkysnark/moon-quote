<script lang="ts">
    import LibraryWindow from "./library/LibraryWindow.svelte";
    import ContextMenuDisplay from "./ContextMenuDisplay.svelte";
    import type { BookDatabaseEntry } from "./backend";
    import ReaderWindow from "./reader/ReaderWindow.svelte";

    let currentBook: BookDatabaseEntry = null;
</script>

<ContextMenuDisplay />

{#if currentBook}
    <ReaderWindow
        bookEntry={currentBook}
        on:goBack={() => (currentBook = null)}
    />
{:else}
    <LibraryWindow on:open={(e) => (currentBook = e.detail)} />
{/if}
