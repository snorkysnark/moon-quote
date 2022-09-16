<script lang="ts">
    import {
        type BookDatabaseEntry,
        type AnnotationDatabaseEntry,
        loadEpub,
    } from "../backend";
    import type { Book } from "epubjs";
    import { createEventDispatcher } from "svelte";
    import ReaderMainView from "./ReaderMainView.svelte";
    import { Loading, Window, WindowHeader } from "src/decor";

    export let bookEntry: BookDatabaseEntry;
    export let goToAnnotation: AnnotationDatabaseEntry = null;

    let epubPromise: Promise<Book> = loadEpub(bookEntry);

    const dispatch = createEventDispatcher<{ goBack: void }>();
</script>

<Window>
    <svelte:fragment slot="top">
        <button id="goBack" on:click={() => dispatch("goBack")}>←</button>
        <WindowHeader>{bookEntry.metaTitle}</WindowHeader>
    </svelte:fragment>

    <svelte:fragment slot="main">
        {#await epubPromise}
            <Loading />
        {:then epub}
            <ReaderMainView {epub} {bookEntry} {goToAnnotation} />
        {/await}
    </svelte:fragment>
</Window>

<style>
    #goBack {
        width: 50px;
        font-size: 25px;
    }
</style>
