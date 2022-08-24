<script lang="ts">
    import { dbQuery } from "./lib/commands";

    import LibraryView from "./lib/LibraryView.svelte";
    import ReaderView from "./lib/ReaderView.svelte";

    dbQuery("SELECT cover_path FROM books", []).then((rows) => console.log(rows));

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
