<script lang="ts">
    import LibraryWindow from "./library/LibraryWindow.svelte";
    import ContextMenuDisplay from "./ContextMenuDisplay.svelte";
    import type { BookDatabaseEntry } from "./backend";
    import ReaderWindow from "./reader/ReaderWindow.svelte";
    import { onAnnotationLink } from "./deeplink";

    let currentBook: BookDatabaseEntry = null;

    onAnnotationLink((link) => {
        console.log(link);
    });
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
