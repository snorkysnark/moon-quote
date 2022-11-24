<script lang="ts">
    import type { Book, Rendition } from "epubjs";

    export let epub: Book;

    let container: HTMLElement;
    let rendition: Rendition;

    $: {
        if (rendition) {
            rendition.destroy();
        }
        if (container) {
            rendition = epub.renderTo(container, {
                height: "100%",
                width: "100%",
                flow: "scrolled-doc",
                allowScriptedContent: true, //Needed for arrow key navigation
            });
            rendition.display(0);
        }
    }
</script>

<div class="w-full h-full" bind:this={container} />
