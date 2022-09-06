<svelte:options immutable={true} />

<script lang="ts">
    import type { AnnotationDatabaseEntry } from "src/backend";

    import { getContext, onMount } from "svelte";
    import type { EpubDisplayContext } from "./EpubDisplay.svelte";

    export let annotation: AnnotationDatabaseEntry;

    const context = getContext<EpubDisplayContext>("EpubDisplay");

    onMount(() => {
        context.addAnnotation(annotation.cfi, onClick, undefined, {
            fill: `var(--highlight${annotation.color})`,
        });

        return () => {
            context.removeAnnotation(annotation.cfi);
        };
    });

    function onClick() {
        console.log("Clicked annotation", annotation);
    }
</script>
