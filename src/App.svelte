<script lang="ts">
    import LibraryWindow from "./library/LibraryWindow.svelte";
    import ContextMenuDisplay from "./ContextMenuDisplay.svelte";
    import type { AnnotationDatabaseEntry, BookDatabaseEntry } from "./backend";
    import ReaderWindow from "./reader/ReaderWindow.svelte";
    import { onAnnotationLink } from "./deeplink";
    import { onMount, tick } from "svelte";
    import type ReaderMainView from "./reader/ReaderMainView.svelte";

    let currentBook: BookDatabaseEntry = null;
    let bookView: ReaderMainView;

    let targetAnnotation: AnnotationDatabaseEntry | string = null;
    $: if (bookView && targetAnnotation) {
        bookView.goToAnnotation(targetAnnotation);
        targetAnnotation = null;
    }

    onMount(() => {
        const unsubscribe = onAnnotationLink((link) => {
            currentBook = link.book;
            tick().then(() => {
                targetAnnotation = link.annotation;
            });
        });

        return async () => {
            (await unsubscribe)();
        };
    });
</script>

<ContextMenuDisplay />

{#if currentBook}
    {#key currentBook.bookId}
        <ReaderWindow
            bookEntry={currentBook}
            on:goBack={() => {
                currentBook = null;
            }}
            bind:mainView={bookView}
        />
    {/key}
{:else}
    <LibraryWindow on:open={(e) => (currentBook = e.detail)} />
{/if}
