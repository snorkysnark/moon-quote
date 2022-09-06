<script lang="ts">
    import { EpubCFI } from "epubjs";
    import type { AnnotationDatabaseEntry } from "src/backend";
    import { createEventDispatcher } from "svelte";

    export let selectedAnnotation: AnnotationDatabaseEntry;
    export let bookDocument: Document;

    let annotationCfi: EpubCFI;
    $: annotationCfi = selectedAnnotation
        ? new EpubCFI(selectedAnnotation.cfi)
        : null;

    let annotationRange: Range;
    $: annotationRange = annotationCfi?.toRange(bookDocument);

    let position: { x: number; y: number };
    function computePosition(range: Range) {
        const rect = range.getBoundingClientRect();
        const x = rect.x + rect.width / 2;
        const y =
            bookDocument.body.clientHeight - rect.y > 100
                ? rect.y + rect.height
                : rect.y - 50;
        return { x, y };
    }
    $: if (annotationRange) position = computePosition(annotationRange);

    const dispatch =
        createEventDispatcher<{ deleteAnnotation: AnnotationDatabaseEntry }>();
</script>

{#if annotationRange}
    <div id="box" style="left: {position.x}px; top: {position.y}px;">
        <button
            on:click={() => dispatch("deleteAnnotation", selectedAnnotation)}
            >Delete</button
        >
    </div>
{/if}

<style>
    #box {
        position: absolute;
        user-select: none;
        z-index: 1;

        background: white;
        padding: 5px;
        border-radius: 10px;
        box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8);
        display: flex;
        gap: 5px;
    }
</style>
