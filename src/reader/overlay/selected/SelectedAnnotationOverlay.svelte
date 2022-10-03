<script lang="ts">
    import type { Contents } from "epubjs";
    import type { AnnotationDatabaseEntry } from "src/backend";
    import { cfiToRangeSafe } from "src/utils";
    import SelectedAnnotationControls from "./SelectedAnnotationControls.svelte";

    export let selectedAnnotation: AnnotationDatabaseEntry;
    export let contents: Contents;

    let annotationRange: Range = null;
    $: annotationRange = cfiToRangeSafe(contents, selectedAnnotation.cfi);

    const padding = 5;
    let rect: DOMRect;
    $: if (annotationRange) {
        const annotationRect = annotationRange.getBoundingClientRect();
        annotationRect.x -= padding;
        annotationRect.y -= padding;
        annotationRect.width += padding * 2;
        annotationRect.height += padding * 2;

        rect = annotationRect;
    }
</script>

{#if annotationRange}
    <SelectedAnnotationControls
        {rect}
        {contents}
        {selectedAnnotation}
        on:deleteAnnotation
    />
    <div
        id="selectionBox"
        style="left: {rect.x}px; top: {rect.y}px; width: {rect.width}px; height: {rect.height}px"
    />
{/if}

<style>
    #selectionBox {
        position: absolute;
        border: solid;
        border-color: blue;

        z-index: 1;
        pointer-events: none;
    }
</style>
