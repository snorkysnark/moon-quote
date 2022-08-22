<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import Reader, { type ReaderController } from "./Reader.svelte";

    export let bookPath: string;
    let tocEnabled = false;
    let readerController: ReaderController;

    const dispatch = createEventDispatcher<{ goBack: void }>();
</script>

<div class="container">
    <div class="topPanel">
        <button on:click={() => dispatch("goBack")}>&lt-</button>
        <span>Library</span>
    </div>
    <div class="mainView">
        <div class="readerView">
            <button class="navButton" on:click={() => readerController.prev()}
                >&lt</button
            >
            <div class="readerPage">
                <Reader {bookPath} bind:controller={readerController} />
            </div>
            <button class="navButton" on:click={() => readerController.next()}
                >&gt</button
            >
        </div>
        {#if tocEnabled}
            <div class="toc" />
        {/if}
        <div class="sidePanel">
            <button on:click={() => (tocEnabled = !tocEnabled)}>TOC</button>
        </div>
    </div>
</div>

<style>
    .container {
        display: flex;
        flex-flow: column;
        width: 100%;
        height: 100vh;
    }

    .topPanel {
        background-color: orange;
    }

    .mainView {
        flex: 1 1 auto;
        min-height: 0;
        display: flex;
    }

    .sidePanel {
        width: 50px;
    }

    .toc {
        min-width: 500px;
        background-color: lightblue;
    }

    .readerView {
        flex: 1 1 auto;
        height: 100%;
        display: flex;
    }

    .navButton {
        flex: 1 1 auto;
        border: 0;
        border-radius: 0;
        background-color: #e8e8e8;
        margin: 0;
        color: #b8b8b8;
        font-size: 50px;
        user-select: none;
        cursor: pointer;
    }

    .readerPage {
        z-index: 1;
        background-color: white;
        width: 800px;
        height: 100%;
        box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
    }
</style>
