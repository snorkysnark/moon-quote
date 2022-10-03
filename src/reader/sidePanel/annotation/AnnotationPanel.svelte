<script lang="ts">
    import type { AnnotationDatabaseEntry } from "src/backend";
    import { createEventDispatcher } from "svelte";
    import AnnotationBlock from "./AnnotationBlock.svelte";

    export let annotations: AnnotationDatabaseEntry[];

    const dispatch = createEventDispatcher<{
        annotationClick: AnnotationDatabaseEntry;
        annotationDelete: AnnotationDatabaseEntry;
    }>();
</script>

{#each annotations as annotation}
    <AnnotationBlock
        {annotation}
        on:click={() => dispatch("annotationClick", annotation)}
        on:delete={() => dispatch("annotationDelete", annotation)}
    />
{/each}
