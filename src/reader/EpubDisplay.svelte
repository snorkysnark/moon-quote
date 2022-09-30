<script lang="ts">
    import type { Rendition } from "epubjs";
    import type { AnnotationDatabaseEntry } from "src/backend";
    import type { BookExtended } from "src/structure/bookExtended";
    import { onMount } from "svelte";
    import CustomManager from "./customManager";
    import CustomView from "./customView";
    import RenditionController from "./RenditionController.svelte";

    export let book: BookExtended;
    export let selectedAnnotation: AnnotationDatabaseEntry = null;

    let container: HTMLElement;
    let rendition: Rendition;
    export let controller: RenditionController;

    onMount(async () => {
        rendition = book.epub.renderTo(container, {
            height: "100%",
            width: "100%",
            manager: CustomManager,
            view: CustomView,
            flow: "scrolled-doc",
            allowScriptedContent: true, //Needed for arrow key navigation
        });
    });
</script>

<div id="reader" bind:this={container}>
    <!--Only annotate when rendition fully loaded-->
    {#if rendition}
        <RenditionController
            {book}
            {rendition}
            {selectedAnnotation}
            bind:this={controller}
            on:highlight
            on:mousedown
            on:deleteAnnotation
        >
            <slot />
        </RenditionController>
    {/if}
</div>

<style>
    #reader {
        width: 100%;
        height: 100%;
    }
</style>
