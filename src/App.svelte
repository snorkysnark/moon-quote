<script lang="ts">
    import LibraryWindow from "./library/LibraryWindow.svelte";
    import ContextMenuDisplay from "./ContextMenuDisplay.svelte";
    import type {
        GoToAnnotation,
        AnnotationDatabaseEntry,
        BookDatabaseEntry,
    } from "./backend";
    import ReaderWindow from "./reader/ReaderWindow.svelte";
    import { listen } from "@tauri-apps/api/event";

    let currentBook: BookDatabaseEntry = null;
    let goToAnnotation: AnnotationDatabaseEntry = null;

    listen<GoToAnnotation>("goto_annotation", (event) => {
        const link = event.payload;
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
