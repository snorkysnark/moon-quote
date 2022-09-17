<svelte:options immutable={true} />

<script lang="ts">
    import type { AnnotationDatabaseEntry } from "src/backend";
    import { createEventDispatcher, getContext, onMount } from "svelte";
    import type { EpubDisplayContext } from "./EpubDisplay.svelte";

    export let annotation: AnnotationDatabaseEntry;

    const context = getContext<EpubDisplayContext>("EpubDisplay");
    const dispatch = createEventDispatcher<{ click: MouseEvent }>();

    function onClick(source: MouseEvent) {
        if (source.detail == 1) {
            // Only on mousedown
            dispatch("click", source);
        }
    }

    onMount(() => {
        context.addAnnotation(annotation.cfi.toString(), onClick, undefined, {
            fill: `var(--highlight${annotation.color})`,
        });
        return () => {
            context.removeAnnotation(annotation.cfi.toString());
        };
    });
</script>
