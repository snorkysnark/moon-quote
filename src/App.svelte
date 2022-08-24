<script lang="ts">
    import LibraryView from "./lib/LibraryView.svelte";
    import ReaderView from "./lib/ReaderView.svelte";

    let currentBookPath = null;
</script>

<main>
    {#if currentBookPath === null}
        <LibraryView
            on:openBook={(event) => (currentBookPath = event.detail)}
        />
    {:else}
        <ReaderView
            bookPath={currentBookPath}
            on:goBack={() => (currentBookPath = null)}
        />
    {/if}
</main>
