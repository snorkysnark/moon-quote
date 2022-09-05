<script lang="ts">
    import { convertFileSrc } from "@tauri-apps/api/tauri";
    import AddContextMenu from "../AddContextMenu.svelte";
    import type { BookDatabaseEntry } from "../backend";

    export let bookEntry: BookDatabaseEntry;

    let coverUrl: string;
    $: coverUrl = bookEntry.coverPath
        ? convertFileSrc(bookEntry.coverPath)
        : null;

    let button: HTMLElement;
</script>

<button bind:this={button}>
    {#if coverUrl}
        <img src={coverUrl} alt={bookEntry.metaTitle} draggable="false" />
    {/if}
    <p>{bookEntry.metaTitle}</p>
</button>

{#if button}
    <AddContextMenu
        target={button}
        items={[{ label: "Open Folder" }, { label: "Delete" }]}
    />
{/if}

<style>
    button {
        min-height: 200px;
    }

    img {
        height: 200px;
        object-fit: contain;
    }
</style>
