<script lang="ts">
    import type { BookDatabaseEntry } from "src/backend/library";
    import { createEventDispatcher } from "svelte";

    export let bookEntry: BookDatabaseEntry;

    const dispatch = createEventDispatcher<{ close: void }>();
</script>

<div class="flex flex-col h-screen select-none">
    <div class="bg-orange-400 h-10 flex">
        <button
            class="bg-gray-200 text-2xl px-3 mr-2"
            on:click={() => dispatch("close")}>←</button
        >
        <h1
            class="text-2xl font-bold self-center flex-auto cursor-default overflow-hidden overflow-ellipsis whitespace-nowrap"
        >
            {bookEntry.metaTitle}
        </h1>
    </div>
</div>
