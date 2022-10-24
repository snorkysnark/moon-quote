<script lang="ts">
    import { convertFileSrc } from "@tauri-apps/api/tauri";
    import type { BookDatabaseEntry } from "src/backend/library";
    import { createEventDispatcher } from "svelte";
    import { contextMenu } from "src/contextmenu";

    export let bookEntry: BookDatabaseEntry;

    let dispatch = createEventDispatcher<{
        open: void;
        delete: void;
    }>();

    let coverUrl: string;
    $: coverUrl = bookEntry.coverPath
        ? convertFileSrc(bookEntry.coverPath)
        : null;
</script>

<button class="bg-gray-100" use:contextMenu={[
    { label: "Open Folder" },
    { label: "Delete" },
]}>
    {#if coverUrl}
        <img
            class="h-52 object-contain mx-auto"
            src={coverUrl}
            alt={bookEntry.metaTitle}
            draggable="false"
        />
    {/if}
    <p class="text-sm">{bookEntry.metaTitle}</p>
</button>
