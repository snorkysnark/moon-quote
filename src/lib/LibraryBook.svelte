<script lang="ts">
    import * as tauri from "@tauri-apps/api/tauri";
    import { createEventDispatcher } from "svelte";
    import type { BookEntry } from "./library/data";

    export let book: BookEntry;

    let coverUrl: string;
    $: coverUrl = book.coverPath ? tauri.convertFileSrc(book.coverPath) : null;

    const dispatch = createEventDispatcher<{ delete: number }>();

    function onRightClick(event: Event) {
        event.preventDefault();
        dispatch("delete", book.bookId);
    }
</script>

<button on:contextmenu={onRightClick}>
    {#if coverUrl}
        <img src={coverUrl} alt={book.metaTitle} />
    {/if}
    <p>{book.metaTitle}</p>
</button>

<style>
    img {
        height: 200px;
        object-fit: contain;
    }
</style>
