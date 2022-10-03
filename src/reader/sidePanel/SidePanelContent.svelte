<script lang="ts">
    import type { AnnotationDatabaseEntry } from "src/backend";
    import type { BookExtended } from "src/structure/bookExtended";
    import type { NavItemFoldable } from "src/structure/tocFoldable";
    import type { TreeExtended } from "src/structure/tree";
    import AnnotationPanel from "./annotation/AnnotationPanel.svelte";
    import ToC from "./toc/ToC.svelte";

    export let book: BookExtended;
    export let toc: TreeExtended<NavItemFoldable>[];
    export let annotations: AnnotationDatabaseEntry[];
    export let currentSidePanel: string = null;
</script>

<div id="sidePanel">
    {#if currentSidePanel === "toc"}
        <ToC {book} items={toc} on:navigate />
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
