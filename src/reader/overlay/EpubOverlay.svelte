<script lang="ts">
    import type { AnnotationDatabaseEntry } from "src/backend";
    import OverlayOnSelection from "./OverlayOnSelection.svelte";

    export let bookDocument: Document;
    export let selectedAnnotation: AnnotationDatabaseEntry = null;

    $: console.log(selectedAnnotation);
</script>

<OverlayOnSelection on:highlight {bookDocument} />
