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
        <button on:click={() => (currentBookPath = null)}>Back</button>
        <Reader bookPath={currentBookPath} />
    {/if}
</main>

<style>
</style>
