<script lang="ts" context="module">
    export interface EpubDisplayContext {
        addAnnotation: (
            cfi: string,
            callback?: Function,
            className?: string,
            styles?: object
        ) => void;
        removeAnnotation: (cfi: string) => void;
    }
</script>

<script lang="ts">
    import type { Contents, Rendition } from "epubjs";
    import type { AnnotationDatabaseEntry } from "src/backend";
    import type { BookExtended } from "src/structure/bookExtended";
    import { createEventDispatcher, onMount, setContext } from "svelte";
    import type { RenditionController } from "./renditionExtension";
    import * as renditionExtension from "./renditionExtension";
    import CustomManager from "./customManager";
    import CustomView from "./customView";
    import EpubOverlay from "./overlay/EpubOverlay.svelte";
    import type { NewHighlight } from "./overlay/HighlighterOverlay.svelte";

    export let book: BookExtended;
    export let selectedAnnotation: AnnotationDatabaseEntry = null;

    let outerContainer: HTMLElement; // Container created by this component
    let rendition: Rendition;
    let innerContainer: HTMLElement; // Contaier created by svelte
    let contents: Contents;

    let overlay: EpubOverlay;
    let displayTarget: string | number = null;

    const dispatch = createEventDispatcher<{
        highlight: NewHighlight;
        mousedown: MouseEvent;
        deleteAnnotation: AnnotationDatabaseEntry;
    }>();

    onMount(async () => {
        rendition = book.epub.renderTo(outerContainer, {
            height: "100%",
            width: "100%",
            manager: CustomManager,
            view: CustomView,
            flow: "scrolled-doc",
            allowScriptedContent: true, //Needed for arrow key navigation
        });
        rendition.hooks.content.register(
            (newContents: Contents) => (contents = newContents)
        );
        rendition.on("started", () => {
            rendition.manager.on("viewResized", () => {
                // Hacky: force the overlay to refresh when iframe is resized
                contents = contents;
            });
        });
        rendition.on("mousedown", (event: MouseEvent) => {
            dispatch("mousedown", event);
        });
        rendition.on("keydown", onKeyDown);
        await rendition.display(displayTarget || 0);

        innerContainer = rendition.manager.container;
        overlay = new EpubOverlay({
            target: innerContainer,
        });
        overlay.$on("highlight", (event) => {
            dispatch("highlight", event.detail);
        });
        overlay.$on("deleteAnnotation", (event) =>
            dispatch("deleteAnnotation", event.detail)
        );
    });

    $: if (overlay) overlay.$set({ contents });
    $: if (overlay) overlay.$set({ selectedAnnotation });

    setContext<EpubDisplayContext>("EpubDisplay", {
        // Allow components in the <slot/> to modify annotations
        addAnnotation: (
            cfi: string,
            callback?: Function,
            className?: string,
            styles?: object
        ) => {
            rendition.annotations.highlight(
                cfi,
                undefined,
                callback,
                className,
                styles
            );
        },
        removeAnnotation: (cfi: string) => {
            rendition.annotations.remove(cfi, "highlight");
        },
    });

    export const controller: RenditionController = {
        next: () => rendition.next(),
        prev: () => rendition.prev(),
        nextPage: () => renditionExtension.nextPage(rendition),
        prevPage: () => renditionExtension.prevPage(rendition),
        display: async (target: string | number) => {
            if (rendition) {
                await rendition.display(target);
            } else {
                displayTarget = target;
            }
        },
        scrollUp: () => {
            rendition.manager.scrollBy(0, -20, false);
        },
        scrollDown: () => {
            rendition.manager.scrollBy(0, 20, false);
        },
        startOfChapter: () =>
            renditionExtension.startOfChapter(book, rendition),
        nextChapter: () => renditionExtension.nextChapter(book, rendition),
        prevChapter: () => renditionExtension.prevChapter(book, rendition),
        startOfBook: () => renditionExtension.startOfBook(rendition),
        endOfBook: () => renditionExtension.endOfBook(book, rendition),
    };

    function onKeyDown(event: KeyboardEvent) {
        if (!rendition) return;
        switch (event.key) {
            case "PageUp":
            case "ArrowLeft":
                if (event.ctrlKey) {
                    controller.prevChapter();
                } else {
                    controller.prevPage();
                }
                break;
            case "PageDown":
            case "ArrowRight":
                if (event.ctrlKey) {
                    controller.nextChapter();
                } else {
                    controller.nextPage();
                }
                break;
            case "ArrowUp":
                controller.scrollUp();
                break;
            case "ArrowDown":
                controller.scrollDown();
                break;
            case "Home":
                if (event.ctrlKey) {
                    controller.startOfBook();
                } else {
                    controller.startOfChapter();
                }
                break;
            case "End":
                if (event.ctrlKey) {
                    controller.endOfBook();
                }
                break;
        }
    }
</script>

<svelte:window on:keydown={onKeyDown} />
<div id="reader" bind:this={outerContainer}>
    <!--Only annotate when rendition fully loaded-->
    {#if innerContainer}
        <slot />
    {/if}
</div>

<style>
    #reader {
        width: 100%;
        height: 100%;
    }
</style>
