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
    import { disableMainInput } from "src/inputGroup";
    import type { BookExtended } from "src/structure/bookExtended";
    import { cfiToRangeSafe } from "src/utils";
    import { createEventDispatcher, onMount, setContext } from "svelte";
    import CustomView from "./customView";
    import EpubOverlay from "./overlay/EpubOverlay.svelte";
    import type { NewHighlight } from "./overlay/HighlighterOverlay.svelte";

    export let book: BookExtended;
    export let selectedAnnotation: AnnotationDatabaseEntry = null;

    let container: HTMLElement;
    let rendition: Rendition;
    let contents: Contents;
    let overlay: EpubOverlay;

    let mounted = false;

    let nextSelectionCfi: string = null;
    function setSelectionCfi(target: string) {
        if (contents) {
            contents.window.focus();

            const range = cfiToRangeSafe(contents, target);
            if (range) {
                contents.document.getSelection().removeAllRanges();
                contents.document.getSelection().addRange(range);
                return true;
            }
        }
        return false;
    }

    const dispatch = createEventDispatcher<{
        highlight: NewHighlight;
        mousedown: MouseEvent;
        deleteAnnotation: AnnotationDatabaseEntry;
    }>();

    onMount(async () => {
        rendition = book.epub.renderTo(container, {
            height: "100%",
            width: "100%",
            view: CustomView,
            flow: "scrolled-doc",
            allowScriptedContent: true, //Needed for arrow key navigation
        });
        rendition.hooks.content.register((newContents: Contents) => {
            contents = newContents;
            if (nextSelectionCfi && setSelectionCfi(nextSelectionCfi)) {
                nextSelectionCfi = null;
            }
        });
        rendition.on("viewResized", () => {
            // Force the overlay to refresh when iframe is resized
            contents = contents;
        });
        rendition.on("mousedown", (event: MouseEvent) => {
            dispatch("mousedown", event);
        });
        rendition.on("keydown", onKeyDown);

        await rendition.display(0);

        const innerContainer = rendition.container;
        overlay = new EpubOverlay({
            target: innerContainer,
        });
        overlay.$on("highlight", (event) => {
            dispatch("highlight", event.detail);
        });
        overlay.$on("deleteAnnotation", (event) =>
            dispatch("deleteAnnotation", event.detail)
        );

        mounted = true;
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

    function onKeyDown(event: KeyboardEvent) {
        if ($disableMainInput > 0) return;
        switch (event.key) {
            case "PageUp":
            case "ArrowLeft":
                if (event.ctrlKey) {
                    prevChapter();
                } else {
                    prevPage();
                }
                break;
            case "PageDown":
            case "ArrowRight":
                if (event.ctrlKey) {
                    nextChapter();
                } else {
                    nextPage();
                }
                break;
            case "ArrowUp":
                scrollUp();
                break;
            case "ArrowDown":
                scrollDown();
                break;
            case "Home":
                if (event.ctrlKey) {
                    startOfBook();
                } else {
                    startOfChapter();
                }
                break;
            case "End":
                if (event.ctrlKey) {
                    endOfBook();
                }
                break;
        }
    }

    // rendition controls
    export async function next() {
        await rendition.next();
    }
    export async function prev() {
        await rendition.prev();
    }
    export async function display(
        target: string | number,
        select: boolean = false,
        position: "top" | "center" = "top"
    ) {
        await rendition.display(target, position);
        if (select && typeof target === "string") {
            if (!setSelectionCfi(target)) {
                nextSelectionCfi = target;
            }
        }
    }
    export function scrollUp() {
        rendition.scrollBy(0, -20);
    }
    export function scrollDown() {
        rendition.scrollBy(0, 20);
    }
    export async function nextPage() {
        const container = rendition.container
        const delta = container.clientHeight;
        const newScrollTop = container.scrollTop + delta;

        if (newScrollTop < container.scrollHeight) {
            rendition.scrollBy(0, delta);
        } else {
            await rendition.next();
        }
    }
    export async function prevPage() {
        const container = rendition.container;
        const delta = -container.clientHeight;

        if (container.scrollTop > 0) {
            rendition.scrollBy(0, delta);
        } else {
            await rendition.prev();
        }
    }
    export async function startOfChapter() {
        const chapter = book.getChapter(rendition.location.start.cfi);
        const target = chapter ? chapter.data.nav.href : 0;
        await rendition.display(target);
    }
    export async function nextChapter() {
        const currentChapter = book.getChapter(
            rendition.location.start.cfi
        )?.data;
        if (currentChapter) {
            const next = currentChapter.next?.data;
            if (next) {
                await rendition.display(next.nav.href);
            }
        } else {
            const first = book.chapters[0];
            if (first) {
                await rendition.display(first.data.nav.href);
            }
        }
    }
    export async function prevChapter() {
        const currentChapter = book.getChapter(
            rendition.location.start.cfi
        )?.data;

        if (currentChapter && currentChapter.prev) {
            await rendition.display(currentChapter.prev.data.nav.href);
        } else {
            await startOfBook();
        }
    }
    export async function startOfBook() {
        await rendition.display(0);
    }
    export async function endOfBook() {
        await rendition.display(book.epub.spine.spineItems.length - 1);
        rendition.scrollTo(0, "MAX");
    }
</script>

<svelte:window on:keydown={onKeyDown} />
<div id="reader" bind:this={container}>
    <!--Only annotate when rendition fully loaded-->
    {#if mounted}
        <slot />
    {/if}
</div>

<style>
    #reader {
        width: 100%;
        height: 100%;
    }
</style>
