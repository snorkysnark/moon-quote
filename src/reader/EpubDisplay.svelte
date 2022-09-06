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
    import { EpubCFI, type Book, type Contents, type Rendition } from "epubjs";
import type { AnnotationDatabaseEntry } from "src/backend";
    import { createEventDispatcher, onMount, setContext } from "svelte";
    import EpubOverlay from "./overlay/EpubOverlay.svelte";

    export let book: Book;
    export let selectedAnnotation: AnnotationDatabaseEntry = null;

    let viewContainer: HTMLElement;
    let rendition: Rendition;
    let overlay: EpubOverlay;
    let readyToAnnotate: boolean = false;

    const dispatch = createEventDispatcher<{
        highlight: EpubHighlightDetail;
        click: MouseEvent;
        deleteAnnotation: AnnotationDatabaseEntry;
    }>();

    onMount(async () => {
        rendition = book.renderTo(viewContainer, {
            height: "100%",
            width: "100%",
            flow: "scrolled-doc",
            allowScriptedContent: true, //Needed for arrow key navigation
        });
        rendition.hooks.content.register(onContentsChange);
        rendition.on("click", (event: MouseEvent) => dispatch("click", event));
        await rendition.display(10);
        // renditions.annotations only becomes initialized
        // after the first page is rendered
        readyToAnnotate = true;
    });

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


    // Insert overlay into HTML
    function onContentsChange(contents: Contents) {
        if (overlay) overlay.$destroy();

        // @ts-ignore: rendition.views() is of type Views, not View[]
        const innerView: HTMLDivElement = rendition.views().first().element;
        overlay = new EpubOverlay({
            target: innerView,
            props: {
                bookDocument: contents.document,
            },
        });
        overlay.$on("highlight", (event) => {
            const { range, color } = event.detail;
            const cfi = new EpubCFI(range, contents.cfiBase);

            dispatch("highlight", { cfi, range, color });
        });
        overlay.$on("deleteAnnotation", (event) => {
            dispatch("deleteAnnotation", event.detail);
        });
    }

    $: if(overlay) overlay.$set({ selectedAnnotation });

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

<div id="reader" bind:this={viewContainer}>
    {#if readyToAnnotate}
        <slot />
    {/if}
</div>

<style>
    #reader {
        width: 100%;
        height: 100%;
    }
</style>
