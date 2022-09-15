<script lang="ts">
    import LibraryWindow from "./library/LibraryWindow.svelte";
    import ContextMenuDisplay from "./ContextMenuDisplay.svelte";
    import type { AnnotationDatabaseEntry, BookDatabaseEntry } from "./backend";
    import ReaderWindow from "./reader/ReaderWindow.svelte";
    import { onAnnotationLink } from "./deeplink";
    import { onDestroy } from "svelte";

    let currentBook: BookDatabaseEntry = null;
    let goToAnnotation: AnnotationDatabaseEntry = null;

    const unsubscribe = onAnnotationLink((link) => {
        currentBook = link.book;
        goToAnnotation = link.annotation;
    });

    onDestroy(async () => {
        (await unsubscribe)();
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
