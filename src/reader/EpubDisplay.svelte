<script lang="ts">
    import type { Book, Rendition } from "epubjs";
    import ReaderController from "./controller";
    import MoonQuoteView from "./customView";
    import MoonQuoteManager from "./customManager";

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
                view: MoonQuoteView,
                manager: MoonQuoteManager,
                allowScriptedContent: true, //Needed for arrow key navigation
            });
            rendition.display(0);
        }
    }

    export let controller: ReaderController = null;
    $: if (rendition) {
        controller = new ReaderController(rendition);
    }
</script>

<div class="w-full h-full" bind:this={container} />
