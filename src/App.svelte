<script lang="ts">
    import LibraryWindow from "./library/LibraryWindow.svelte";
    import ContextMenuDisplay from "./ContextMenuDisplay.svelte";
    import type { BookDatabaseEntry } from "./backend";
    import ReaderWindow from "./reader/ReaderWindow.svelte";
    import { onAnnotationLink, type Target } from "./deeplink";
    import { onMount, tick } from "svelte";
    import type ReaderMainView from "./reader/ReaderMainView.svelte";

    let currentBook: BookDatabaseEntry = null;
    let bookView: ReaderMainView;

    let target: Target;
    $: if (bookView && target) {
        bookView.goToTarget(target);
        target = null;
    }

    onMount(() => {
        const unsubscribe = onAnnotationLink((link) => {
            currentBook = link.book;
            tick().then(() => {
                target = link.target;
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
