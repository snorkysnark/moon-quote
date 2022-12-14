<script lang="ts">
    import {
        type BookDatabaseEntry,
        type AnnotationDatabaseEntry,
        loadEpub,
        getAnnotationsForBook,
    } from "../backend";
    import { createEventDispatcher } from "svelte";
    import ReaderMainView from "./ReaderMainView.svelte";
    import { Loading, Window, WindowHeader } from "src/decor";
    import type {
        AnnotationInChapter,
        BookExtended,
    } from "src/structure/bookExtended";
    import Overlay from "src/decor/Overlay.svelte";
    import ExportMenu from "./ExportMenu.svelte";

    export let bookEntry: BookDatabaseEntry;
    export let mainView: ReaderMainView = null;

    const dispatch = createEventDispatcher<{ goBack: void }>();
    let book: BookExtended;
    loadEpub(bookEntry).then((loaded) => (book = loaded));

    let annotations: AnnotationDatabaseEntry[];
    getAnnotationsForBook(bookEntry.bookId).then(
        (loaded) => (annotations = loaded)
    );

    let locatedAnnotations: AnnotationInChapter[];
    $: if (book && annotations)
        locatedAnnotations = book.findChaptersForAnnotations(annotations);

    let exportMenu = false;
</script>

{#if exportMenu}
    <Overlay on:close={() => (exportMenu = false)}>
        <ExportMenu {book} annotations={locatedAnnotations} />
    </Overlay>
{/if}

<Window>
    <svelte:fragment slot="top">
        <button id="goBack" on:click={() => dispatch("goBack")}>←</button>
        <WindowHeader>{bookEntry.metaTitle}</WindowHeader>
        {#if book && annotations}
            <button on:click={() => (exportMenu = true)}>Export</button>
        {/if}
    </svelte:fragment>

    <svelte:fragment slot="main">
        {#if book && annotations}
            <ReaderMainView {book} bind:this={mainView} bind:annotations />
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
