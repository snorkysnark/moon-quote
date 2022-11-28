<script lang="ts">
    import type { Book, Rendition } from "epubjs";
    import BlockInputView from "./blockInputView";
    import ReaderController from "./controller";

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
                view: BlockInputView,
                allowScriptedContent: true, //Needed for arrow key navigation
            });
            rendition.display(0);
            rendition.on("keydown", onKeyDown);
        }
    }

    export let controller: ReaderController = null;
    $: if (rendition) {
        controller = new ReaderController(rendition);
    }

    function onKeyDown(event: KeyboardEvent) {
        if (!controller) return;
        switch (event.key) {
            case "PageUp":
            case "ArrowLeft":
                controller.prev();
                break;
            case "PageDown":
            case "ArrowRight":
                controller.next();
                break;
        }
    }
</script>

<svelte:window on:keydown={onKeyDown} />
<div class="w-full h-full" bind:this={container} />
