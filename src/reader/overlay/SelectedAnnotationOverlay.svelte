<script lang="ts">
    import { Contents, EpubCFI } from "epubjs";
    import type { AnnotationDatabaseEntry } from "src/backend";

    export let selectedAnnotation: AnnotationDatabaseEntry;
    export let contents: Contents;

    let annotationCfi: EpubCFI;
    $: annotationCfi = new EpubCFI(selectedAnnotation.cfi);

    let annotationRange: Range = null;
    $: {
        // Check if we are on the right document
        annotationRange = selectedAnnotation.cfi.startsWith(
            `epubcfi(${contents.cfiBase}!`
        )
            ? annotationCfi.toRange(contents.document)
            : null;
    }

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
    }
</style>
