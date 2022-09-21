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

    export interface EpubDisplayController {
        next: () => Promise<void>;
        prev: () => Promise<void>;
        display: (target: string | number) => Promise<void>;
    }
</script>

<script lang="ts">
    import type { Book, Contents, Rendition } from "epubjs";
    import type { AnnotationDatabaseEntry } from "src/backend";
    import { createEventDispatcher, onMount, setContext } from "svelte";
    import CustomManager from "./customManager";
import CustomView from "./customView";
    import EpubOverlay from "./overlay/EpubOverlay.svelte";
    import type { NewHighlight } from "./overlay/HighlighterOverlay.svelte";

    export let book: Book;
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
        switch (event.key) {
            case "PageUp":
            case "ArrowLeft":
                rendition.prev();
                break;
            case "PageDown":
            case "ArrowRight":
                rendition.next();
                break;
            case "ArrowUp":
                rendition.manager.scrollBy(0, -40, true);
                break;
            case "ArrowDown":
                rendition.manager.scrollBy(0, 40, true);
                break;
        }
    }

    onMount(async () => {
        rendition = book.renderTo(outerContainer, {
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
        rendition.on("mousedown", (event: MouseEvent) => {
            dispatch("mousedown", event);
        });
        rendition.on("keydown", onKeyDown);
        // @ts-ignore
        await rendition.display(displayTarget || 0);

        // @ts-ignore: type annotations missing for DefaultViewManager
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

    export const controller: EpubDisplayController = {
        next: async () => {
            if (rendition) await rendition.next();
        },
        prev: async () => {
            if (rendition) await rendition.prev();
        },
        display: async (target) => {
            if (rendition) {
                // @ts-ignore: Overloaded method, display(string | number)
                // should be the same as display(string) + display(number)
                await rendition.display(target);
            } else {
                displayTarget = target;
            }
        },
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
