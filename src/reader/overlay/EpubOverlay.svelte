<script lang="ts">
    import type { Contents } from "epubjs";
    import type { AnnotationDatabaseEntry } from "src/backend";
    import SelectedAnnotationOverlay from "./SelectedAnnotationOverlay.svelte";

    export let selectedAnnotation: AnnotationDatabaseEntry = null;
    export let contents: Contents = null;
</script>

{#if selectedAnnotation && contents}
    <SelectedAnnotationOverlay {selectedAnnotation} {contents} />
{/if}
