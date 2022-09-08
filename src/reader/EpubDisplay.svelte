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

    export interface EpubHighlightDetail {
        cfi: EpubCFI;
        range: Range;
        color: number;
    }

    export interface EpubDisplayController {
        next: () => Promise<void>;
        prev: () => Promise<void>;
        display: (target: string | number) => Promise<void>;
    }
</script>

<script lang="ts">
    import type { EpubCFI, Book, Contents, Rendition } from "epubjs";
    import type { AnnotationDatabaseEntry } from "src/backend";
    import { createEventDispatcher, onMount, setContext } from "svelte";
    import EpubOverlay from "./overlay/EpubOverlay.svelte";

    export let book: Book;
    export let selectedAnnotation: AnnotationDatabaseEntry = null;

    let outerContainer: HTMLElement; // Container created by this component
    let rendition: Rendition;
    let innerContainer: HTMLElement; // Contaier created by svelte
    let contents: Contents;

    let overlay: EpubOverlay;

    const dispatch = createEventDispatcher<{
        highlight: EpubHighlightDetail;
        mousedown: MouseEvent;
        deleteAnnotation: AnnotationDatabaseEntry;
    }>();

    onMount(async () => {
        rendition = book.renderTo(outerContainer, {
            height: "100%",
            width: "100%",
            flow: "scrolled-doc",
            allowScriptedContent: true, //Needed for arrow key navigation
        });
        rendition.hooks.content.register(
            (newContents: Contents) => (contents = newContents)
        );
        rendition.on("mousedown", (event: MouseEvent) => {
            dispatch("mousedown", event);
        });
        await rendition.display(0);

        // @ts-ignore: type annotations missing for DefaultViewManager
        innerContainer = rendition.manager.container;
        overlay = new EpubOverlay({
            target: innerContainer,
        });
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
            if (rendition)
                // @ts-ignore: Overloaded method, display(string | number)
                // should be the same as display(string) + display(number)
                await rendition.display(target);
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
