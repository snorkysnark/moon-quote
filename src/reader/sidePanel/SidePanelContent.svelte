<script lang="ts">
import type { AnnotationDatabaseEntry } from "src/backend";

    import AnnotationPanel from "./annotation/AnnotationPanel.svelte";

    export let currentSidePanel: string = null;
    export let annotations: AnnotationDatabaseEntry[];
</script>

<div id="sidePanel">
    {#if currentSidePanel === "toc"}
        <p>TOC</p>
    {:else if currentSidePanel === "annotations"}
        <AnnotationPanel {annotations} on:annotationClick />
    {/if}
</div>

<style>
    #sidePanel {
        flex: 0 1 auto;
        background-color: lightblue;
        max-width: 500px;
        overflow-y: scroll;
    }
</style>
