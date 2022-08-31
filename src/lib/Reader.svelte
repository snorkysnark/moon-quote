<script lang="ts" context="module">
    export interface ReaderController {
        next: () => Promise<void>;
        prev: () => Promise<void>;
        display: (target: string | number) => Promise<void>;
    }
</script>

<script lang="ts">
    import { EpubCFI, type Book, type Contents, type Rendition } from "epubjs";
    import BookOverlay from "./BookOverlay.svelte";

    export let book: Book;

    let viewContainer: HTMLElement;
    let rendition: Rendition;
    let overlay: BookOverlay;

    export const controller: ReaderController = {
        next: async () => {
            if (rendition) await rendition.next();
        },
        prev: async () => {
            if (rendition) await rendition.prev();
        },
        display: async (target) => {
            if (rendition)
                // @ts-ignore: Overloaded method, display(string | number)
                //should be the same as display(string) + display(number)
                await rendition.display(target);
        },
    };

    function onKeyUp(event: KeyboardEvent) {
        switch (event.key) {
            case "ArrowLeft":
                controller.prev();
                break;
            case "ArrowRight":
                controller.next();
                break;
        }
    }

    function renderBook(container: HTMLElement, book: Book) {
        rendition = book.renderTo(container, {
            height: "100%",
            width: "100%",
            flow: "scrolled-doc",
            allowScriptedContent: true, //Needed for arrow key navigation
        });
        rendition.on("keyup", onKeyUp);
        rendition.hooks.content.register(onContentsChange);
        rendition.display(10);
    }
    $: if (viewContainer) renderBook(viewContainer, book);

    function onContentsChange(contents: Contents) {
        if (overlay) overlay.$destroy();

        // @ts-ignore: rendition.views() is of type Views, not View[]
        const innerView: HTMLDivElement = rendition.views().first().element;
        overlay = new BookOverlay({
            target: innerView,
            props: {
                bookDocument: contents.document,
            },
        });
        overlay.$on("highlight", (event: CustomEvent<Range>) => {
            const cfi = new EpubCFI(event.detail, contents.cfiBase).toString();
            rendition.annotations.highlight(cfi, { cfi: cfi });
        });
    }
</script>

<svelte:window on:keyup={onKeyUp} />
<div id="reader" bind:this={viewContainer} />

<style>
    #reader {
        width: 100%;
        height: 100%;
    }

    :global(.epubjs-hl) {
        fill: green;
        pointer-events: all;
        cursor: pointer;
    }
</style>
