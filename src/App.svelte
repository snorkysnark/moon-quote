<script lang="ts">
    import LibraryView from "./lib/LibraryView.svelte";

    let currentBookPath = null;
</script>

<main>
    {#if currentBookPath === null}
        <LibraryView on:openBook={(event) => currentBookPath = event.detail} />
    {:else}
        <button on:click={() => currentBookPath = null}>Back</button>
        <p>Opened book: {currentBookPath}</p>
    {/if}
</main>

<style>
</style>
