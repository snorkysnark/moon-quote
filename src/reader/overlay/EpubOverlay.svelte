<script lang="ts">
    import type { AnnotationDatabaseEntry } from "src/backend";
    import OverlayOnAnnotation from "./OverlayOnAnnotation.svelte";
    import OverlayOnSelection from "./OverlayOnSelection.svelte";

    export let bookDocument: Document;
    export let selectedAnnotation: AnnotationDatabaseEntry = null;
</script>

<OverlayOnSelection on:highlight {bookDocument} />
<OverlayOnAnnotation {selectedAnnotation} {bookDocument} on:deleteAnnotation />
