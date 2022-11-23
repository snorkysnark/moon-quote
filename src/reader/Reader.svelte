<script lang="ts">
    import { asyncDerived, asyncWritable } from "@square/svelte-store";

    import {
        getAnnotationsForBook,
        loadEpub,
        type BookDatabaseEntry,
    } from "src/backend/library";
    import Loading from "src/decor/Loading.svelte";
    import { createEventDispatcher } from "svelte";
    import { writable } from "svelte/store";
    import ReaderView from "./ReaderView.svelte";

    export let bookEntry: BookDatabaseEntry;
    let bookEntryStore = writable<BookDatabaseEntry>(bookEntry);
    $: bookEntryStore.set(bookEntry);

    const epub = asyncDerived([bookEntryStore], async ([$bookEntry]) => {
        return loadEpub($bookEntry.epubPath);
    });
    const annotations = asyncWritable(
        [bookEntryStore],
        async ([$bookEntry]) => {
            return getAnnotationsForBook($bookEntry.bookId);
        }
    );

    const dispatch = createEventDispatcher<{ close: void }>();
</script>

<div class="flex flex-col h-screen select-none">
    <div class="bg-orange-400 h-10 flex">
        <button
            class="bg-gray-200 text-2xl px-3 mr-2"
            on:click={() => dispatch("close")}>←</button
        >
        <h1
            class="text-2xl font-bold self-center flex-auto \
            cursor-default overflow-hidden overflow-ellipsis whitespace-nowrap"
        >
            {bookEntry.metaTitle}
        </h1>
    </div>
    {#if $epub && $annotations}
        <ReaderView epub={$epub} annotations={$annotations} />
    {:else}
        <Loading />
    {/if}
</div>
