<script lang="ts">
    import type { Book } from "epubjs";
import { onMount } from "svelte";

    export let book: Book;

    let viewContainer: HTMLElement;

    onMount(() => {
        const rendition = book.renderTo(viewContainer, {
            height: "100%",
            width: "100%",
            flow: "scrolled-doc",
            allowScriptedContent: true, //Needed for arrow key navigation
        });
        rendition.display(10);
    });
</script>

<div id="reader" bind:this={viewContainer}></div>

<style>
    #reader {
        width: 100%;
        height: 100%;
    }
</style>
