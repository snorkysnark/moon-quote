<script lang="ts">
    import type { AnnotationDatabaseEntry, BookDatabaseEntry } from "src/backend";
    import { createEventDispatcher } from "svelte";
    import AnnotationBlock from "./AnnotationBlock.svelte";

    export let annotations: AnnotationDatabaseEntry[];
    export let bookEntry: BookDatabaseEntry;

    const dispatch =
        createEventDispatcher<{ annotationClick: AnnotationDatabaseEntry }>();
</script>

{#each annotations as annotation}
    <AnnotationBlock
        {annotation}
        {bookEntry}
        on:click={() => dispatch("annotationClick", annotation)}
    />
{/each}
