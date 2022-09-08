<script lang="ts">
    import type { AnnotationDatabaseEntry } from "src/backend";
    import AnnotationPanel from "./annotation/AnnotationPanel.svelte";
    import type TocItem from "./toc/toc";
    import ToC from "./toc/ToC.svelte";

    export let toc: TocItem[];
    export let annotations: AnnotationDatabaseEntry[];
    export let currentSidePanel: string = null;
</script>

<div id="sidePanel">
    {#if currentSidePanel === "toc"}
        <ToC items={toc} on:navigate />
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
