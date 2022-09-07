<script lang="ts">
    import type { AnnotationDatabaseEntry } from "src/backend";
    import { createEventDispatcher } from "svelte";
    import AnnotationBlock from "./AnnotationBlock.svelte";

    export let annotations: AnnotationDatabaseEntry[];
    const dispatch =
        createEventDispatcher<{ annotationClick: AnnotationDatabaseEntry }>();
</script>

<div id="sidePanel">
    {#each annotations as annotation}
        <AnnotationBlock
            {annotation}
            on:click={() => dispatch("annotationClick", annotation)}
        />
    {/each}
</div>

<style>
    #sidePanel {
        flex: 0 1 auto;
        background-color: lightblue;
        max-width: 500px;
        overflow-y: scroll;
    }
</style>
