<script lang="ts" context="module">
    export interface RenditionControllerContext {
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
    import { createEventDispatcher, setContext } from "svelte";
    import EpubOverlay from "./overlay/EpubOverlay.svelte";
    import type { NewHighlight } from "./overlay/HighlighterOverlay.svelte";

    export let book: BookExtended;
    export let rendition: Rendition;
    export let selectedAnnotation: AnnotationDatabaseEntry = null;

    let contents: Contents;
    let overlay: EpubOverlay;
    let initialized = false;

    const dispatch = createEventDispatcher<{
        highlight: NewHighlight;
        mousedown: MouseEvent;
        deleteAnnotation: AnnotationDatabaseEntry;
    }>();

    async function initialize() {
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

        await rendition.display(0);

        const innerContainer = rendition.manager.container;
        overlay = new EpubOverlay({
            target: innerContainer,
        });
        overlay.$on("highlight", (event) => {
            dispatch("highlight", event.detail);
        });
        overlay.$on("deleteAnnotation", (event) =>
            dispatch("deleteAnnotation", event.detail)
        );
        initialized = true;
    }
    initialize();

    $: if (overlay) overlay.$set({ contents });
    $: if (overlay) overlay.$set({ selectedAnnotation });

    setContext<RenditionControllerContext>("RenditionController", {
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
    export async function display(target: string | number) {
        await rendition.display(target);
    }
    export function scrollUp() {
        rendition.manager.scrollBy(0, -20, false);
    }
    export function scrollDown() {
        rendition.manager.scrollBy(0, 20, false);
    }
    export async function nextPage() {
        const container = rendition.manager.container;
        const delta = container.clientHeight;
        const newScrollTop = container.scrollTop + delta;

        if (newScrollTop < container.scrollHeight) {
            rendition.manager.scrollBy(0, delta, false);
        } else {
            await rendition.next();
        }
    }
    export async function prevPage() {
        const container = rendition.manager.container;
        const delta = -container.clientHeight;

        if (container.scrollTop > 0) {
            rendition.manager.scrollBy(0, delta, false);
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
        await rendition.display(book.getSpine().spineItems.length - 1);
        rendition.manager.scrollToBottom();
    }
</script>

<svelte:window on:keydown={onKeyDown} />
{#if initialized}
    <slot />
{/if}
