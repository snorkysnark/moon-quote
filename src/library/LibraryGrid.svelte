<script lang="ts">
    import type { BookDatabaseEntry } from "../backend";
    import LibraryBook from "./LibraryBook.svelte";

    export let bookEntries: BookDatabaseEntry[];
</script>

<div id="grid">
    {#each bookEntries as bookEntry}
        <LibraryBook on:open on:delete {bookEntry} />
    {/each}
</div>

<style>
    #grid {
        display: grid;
        gap: 10px;
        grid-template-columns: repeat(auto-fit, 200px);
        grid-auto-rows: 1fr;
    }
</style>
