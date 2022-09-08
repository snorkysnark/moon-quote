<script lang="ts">
    import type { Contents } from "epubjs";
    import type { AnnotationDatabaseEntry } from "src/backend";
    import HighlighterOverlay from "./HighlighterOverlay.svelte";
    import SelectedAnnotationOverlay from "./selected/SelectedAnnotationOverlay.svelte";

    export let selectedAnnotation: AnnotationDatabaseEntry = null;
    export let contents: Contents = null;
</script>

{#if contents}
    <HighlighterOverlay {contents} on:highlight />
    {#if selectedAnnotation}
        <SelectedAnnotationOverlay
            {selectedAnnotation}
            {contents}
            on:deleteAnnotation
        />
    {/if}
{/if}
