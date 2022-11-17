<script lang="ts">
    import type { BookDatabaseEntry } from "./backend/library";
    import ContextMenuDisplay from "./ContextMenuDisplay.svelte";
    import Library from "./library/Library.svelte";
    import Reader from "./reader/Reader.svelte";

    let currentBook: BookDatabaseEntry = null;
</script>

<ContextMenuDisplay />
{#if currentBook}
    <Reader bookEntry={currentBook} on:close={() => (currentBook = null)} />
{:else}
    <Library on:open={(e) => (currentBook = e.detail)} />
{/if}
