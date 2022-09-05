<script lang="ts">
    import { convertFileSrc } from "@tauri-apps/api/tauri";
    import type { BookDatabaseEntry } from "../backend";

    export let bookEntry: BookDatabaseEntry;

    let coverUrl: string;
    $: coverUrl = bookEntry.coverPath
        ? convertFileSrc(bookEntry.coverPath)
        : null;
</script>

<button>
    {#if coverUrl}
        <img src={coverUrl} alt={bookEntry.metaTitle} />
    {/if}
    <p>{bookEntry.metaTitle}</p>
</button>

<style>
    button {
        min-height: 200px;
    }

    img {
        height: 200px;
        object-fit: contain;
    }
</style>
