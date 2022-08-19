<script lang="ts">
    import LibraryView from "./lib/LibraryView.svelte";
    import Reader from "./lib/Reader.svelte";

    let currentBookPath = null;
</script>

<main>
    {#if currentBookPath === null}
        <LibraryView
            on:openBook={(event) => (currentBookPath = event.detail)}
        />
    {:else}
        <div class="readerView">
            <button class="readerButton" on:click={() => (currentBookPath = null)}>Back</button>
            <div class="readerContainer">
                <Reader bookPath={currentBookPath} />
            </div>
        </div>
    {/if}
</main>

<style>
    .readerView {
         display: flex;
         flex-flow: column;
         height: calc(100vh - 4rem);
    }

    .readerButton {
        flex: 0 1 auto;
        align-self: center;
    }

    .readerContainer {
        flex: 1 1 auto;
        min-height: 0;
    }
</style>
