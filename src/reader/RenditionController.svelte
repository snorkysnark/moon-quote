<script lang="ts">
    import type { Rendition } from "epubjs";
    import type { BookExtended } from "src/structure/bookExtended";

    export let book: BookExtended;
    export let rendition: Rendition;

    async function initialize() {
        await rendition.display(0);
    }
    initialize();

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
