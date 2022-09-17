<script lang="ts">
    import {
        type BookDatabaseEntry,
        type AnnotationDatabaseEntry,
        loadEpub,
        getAnnotationsForBook,
    } from "../backend";
    import type { Book } from "epubjs";
    import { createEventDispatcher } from "svelte";
    import ReaderMainView from "./ReaderMainView.svelte";
    import { Loading, Window, WindowHeader } from "src/decor";
    import ExportButton from "./ExportButton.svelte";

    const dispatch = createEventDispatcher<{ goBack: void }>();

    export let bookEntry: BookDatabaseEntry;
    export let goToAnnotation: AnnotationDatabaseEntry = null;

    let epub: Book;
    loadEpub(bookEntry).then((loaded) => (epub = loaded));

    let annotations: AnnotationDatabaseEntry[];
    getAnnotationsForBook(bookEntry.bookId).then(
        (loaded) => (annotations = loaded)
    );
</script>

<Window>
    <svelte:fragment slot="top">
        <button id="goBack" on:click={() => dispatch("goBack")}>←</button>
        <WindowHeader>{bookEntry.metaTitle}</WindowHeader>
        {#if epub && annotations}
            <ExportButton {epub} {annotations} />
        {/if}
    </svelte:fragment>

    <svelte:fragment slot="main">
        {#if epub && annotations}
            <ReaderMainView
                {epub}
                bind:annotations
                {bookEntry}
                {goToAnnotation}
            />
        {:else}
            <Loading />
        {/if}
    </svelte:fragment>
</Window>

<style>
    #goBack {
        width: 50px;
        font-size: 25px;
    }
</style>
