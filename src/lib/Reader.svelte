<script lang="ts" context="module">
    export interface ReaderController {
        next: () => Promise<void>;
        prev: () => Promise<void>;
        display: (target: string | number) => Promise<void>;
    }
</script>

<script lang="ts">
    import { EpubCFI, type Book, type Contents, type Rendition } from "epubjs";
    import bookStylesheet from "./book.css?url";
    import BookOverlay from "./BookOverlay.svelte";

    export let book: Book;

    let viewContainer: HTMLElement;
    let rendition: Rendition;

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
        if (rendition) rendition.destroy();

        rendition = book.renderTo(container, {
            height: "100%",
            width: "100%",
            flow: "scrolled-doc",
            stylesheet: bookStylesheet,
            allowScriptedContent: true, //Needed for arrow key navigation
        });
        rendition.on("keyup", onKeyUp);
        rendition.hooks.content.register(onContentsChange);
        rendition.display(10);
    }
    $: if (viewContainer) renderBook(viewContainer, book);

    function onContentsChange(contents: Contents) {
        const overlay = new BookOverlay({
            target: contents.document.body,
            props: { bookDocument: contents.document },
        });
        overlay.$on("highlight", (event: CustomEvent<Range>) => {
            const cfi = new EpubCFI(event.detail, contents.cfiBase);
            rendition.annotations.highlight(
                cfi.toString(),
                undefined,
                undefined,
                undefined,
                {
                    fill: "green",
                    ["pointer-events"]: "all",
                    cursor: "pointer",
                }
            );
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
</style>
