<script lang="ts">
    import type { BookDatabaseEntry, LoadedBook } from "../backend";
    import * as backend from "../backend";
    import { createEventDispatcher } from "svelte";
    import Loading from "../Loading.svelte";
    import ReaderMainView from "./ReaderMainView.svelte";

    export let bookEntry: BookDatabaseEntry;
    let bookPromise: Promise<LoadedBook> = backend.loadBook(bookEntry);

    const dispatch = createEventDispatcher<{ goBack: void }>();
</script>

<main>
    <div id="topPanel">
        <button id="goBack" on:click={() => dispatch("goBack")}>←</button>
        <h1>{bookEntry.metaTitle}</h1>
    </div>
    <div id="mainView">
        {#await bookPromise}
            <Loading />
        {:then book}
            <ReaderMainView {book} />
        {/await}
    </div>
</main>

<style>
    main {
        display: flex;
        flex-flow: column;
        width: 100%;
        height: 100vh;

        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }

    #topPanel {
        max-height: 50px;
        background-color: orange;
        display: flex;
        gap: 10px;
        padding-left: 5px;
        padding-right: 5px;
    }

    h1 {
        margin: 0;
        flex: 1 1 auto;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    #goBack {
        width: 50px;
        font-size: 25px;
    }

    #mainView {
        flex: 1 1 auto;
        min-height: 0;
    }
</style>