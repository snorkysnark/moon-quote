<svelte:options immutable={true} />

<script lang="ts">
    import type { AnnotationDatabaseEntry } from "src/backend";

    import { createEventDispatcher, getContext, onDestroy } from "svelte";
    import type { EpubDisplayContext } from "./EpubDisplay.svelte";

    export let annotation: AnnotationDatabaseEntry;
    export let selected: boolean = false;

    let hasBeenApplied: boolean = false;
    const context = getContext<EpubDisplayContext>("EpubDisplay");

    function applyHighlight(
        annotation: AnnotationDatabaseEntry,
        selected: boolean
    ) {
        if (hasBeenApplied) context.removeAnnotation(annotation.cfi);

        const className = selected ? "epubjs-hl-selected" : "epubjs-hl";
        context.addAnnotation(annotation.cfi, onClick, className, {
            fill: `var(--highlight${annotation.color})`,
        });
        hasBeenApplied = true;
    }
    $: applyHighlight(annotation, selected);

    onDestroy(() => {
        if (hasBeenApplied) {
            context.removeAnnotation(annotation.cfi);
        }
    });

    const dispatch = createEventDispatcher<{ click: MouseEvent }>();
    function onClick(source: MouseEvent) {
        source.stopPropagation();
        dispatch("click", source);
    }
</script>
