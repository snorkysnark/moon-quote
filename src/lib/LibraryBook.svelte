<script lang="ts">
    import * as tauri from "@tauri-apps/api/tauri";
    import { createEventDispatcher } from "svelte";
    import type { BookEntry } from "./library/data";

    export let book: BookEntry;

    let coverUrl: string;
    $: coverUrl = book.coverPath ? tauri.convertFileSrc(book.coverPath) : null;

    const dispatch = createEventDispatcher<{ delete: void }>();

    function onContextMenu(event: Event) {
        event.preventDefault();
        dispatch("delete");
    }
</script>

<button on:click on:contextmenu={onContextMenu}>
    {#if coverUrl}
        <img src={coverUrl} alt={book.metaTitle} />
    {/if}
    <p>{book.metaTitle}</p>
</button>

<style>
    button {
        cursor: pointer;
        min-width: 150px;
        min-height: 200px;
    }

    img {
        height: 200px;
        object-fit: contain;
    }
</style>
