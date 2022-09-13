<script lang="ts">
    import LibraryWindow from "./library/LibraryWindow.svelte";
    import ContextMenuDisplay from "./ContextMenuDisplay.svelte";
    import type { AnnotationDatabaseEntry, BookDatabaseEntry } from "./backend";
    import ReaderWindow from "./reader/ReaderWindow.svelte";
    import { onAnnotationLink } from "./deeplink";

    let currentBook: BookDatabaseEntry = null;
    let goToAnnotation: AnnotationDatabaseEntry = null;

    onAnnotationLink((link) => {
        currentBook = link.book;
        goToAnnotation = link.annotation;
    });
</script>

<ContextMenuDisplay />

{#if currentBook}
    <ReaderWindow
        bookEntry={currentBook}
        {goToAnnotation}
        on:goBack={() => (currentBook = null)}
    />
{:else}
    <LibraryWindow on:open={(e) => (currentBook = e.detail)} />
{/if}
