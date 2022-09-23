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
    import type { RenditionController } from "./controller";
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

    function onKeyDown(event: KeyboardEvent) {
        if (!rendition) return;
        switch (event.key) {
            case "PageUp":
            case "ArrowLeft":
                controller.prevPage();
                break;
            case "PageDown":
            case "ArrowRight":
                controller.nextPage();
                break;
            case "ArrowUp":
                controller.scrollUp();
                break;
            case "ArrowDown":
                controller.scrollDown();
                break;
            case "Home":
                controller.startOfChapter();
                break;
            case "End":
                controller.endOfChapter();
                break;
        }
    }

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

    export const controller: RenditionController = {
        next: async () => {
            await rendition.next();
        },
        prev: async () => {
            await rendition.prev();
        },
        nextPage: async () => {
            const container = rendition.manager.container;
            const delta = container.clientHeight;
            const newScrollTop = container.scrollTop + delta;

            if (newScrollTop < container.scrollHeight) {
                rendition.manager.scrollBy(0, delta, false);
            } else {
                await controller.next();
            }
        },
        prevPage: async () => {
            const container = rendition.manager.container;
            const delta = -container.clientHeight;

            if (container.scrollTop > 0) {
                rendition.manager.scrollBy(0, delta, false);
            } else {
                await controller.prev();
            }
        },
        display: async (target: string | number) => {
            if (rendition) {
                await rendition.display(target);
            } else {
                displayTarget = target;
            }
        },
        scrollUp: () => {
            rendition.manager.scrollBy(0, -40, true);
        },
        scrollDown: () => {
            rendition.manager.scrollBy(0, 40, true);
        },
        startOfChapter: async () => {},
        endOfChapter: async () => {},
    };

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
