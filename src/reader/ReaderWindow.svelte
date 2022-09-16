<script lang="ts">
    import type {
        BookDatabaseEntry,
        AnnotationDatabaseEntry,
    } from "../backend";
    import * as backend from "../backend";
    import { createEventDispatcher } from "svelte";
    import Loading from "../Loading.svelte";
    import ReaderMainView from "./ReaderMainView.svelte";
    import type { Book } from "epubjs";
    import Window from "src/decor/Window.svelte";
    import WindowHeader from "src/decor/WindowHeader.svelte";

    export let bookEntry: BookDatabaseEntry;
    export let goToAnnotation: AnnotationDatabaseEntry = null;

    let epubPromise: Promise<Book> = backend.loadEpub(bookEntry);

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
