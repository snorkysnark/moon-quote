import type { Rendition } from "epubjs";
import type { BookExtended } from "src/structure/bookExtended";

export interface RenditionController {
    next: () => Promise<void>;
    prev: () => Promise<void>;
    nextPage: () => Promise<void>;
    prevPage: () => Promise<void>;
    display: (target: string | number) => Promise<void>;
    scrollUp: () => void;
    scrollDown: () => void;
    startOfChapter: () => Promise<void>;
    nextChapter: () => Promise<void>;
    prevChapter: () => Promise<void>;
    startOfBook: () => Promise<void>;
    endOfBook: () => Promise<void>;
}

export async function nextPage(rendition: Rendition) {
    const container = rendition.manager.container;
    const delta = container.clientHeight;
    const newScrollTop = container.scrollTop + delta;

    if (newScrollTop < container.scrollHeight) {
        rendition.manager.scrollBy(0, delta, false);
    } else {
        await rendition.next();
    }
}

export async function prevPage(rendition: Rendition) {
    const container = rendition.manager.container;
    const delta = -container.clientHeight;

    if (container.scrollTop > 0) {
        rendition.manager.scrollBy(0, delta, false);
    } else {
        await rendition.prev();
    }
}

export async function startOfChapter(book: BookExtended, rendition: Rendition) {
    const chapter = book.getChapter(rendition.location.start.cfi);
    const target = chapter ? chapter.data.nav.href : 0;
    await rendition.display(target);
}

export async function nextChapter(book: BookExtended, rendition: Rendition) {
    const currentChapter = book.getChapter(rendition.location.start.cfi)?.data;
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

export async function prevChapter(book: BookExtended, rendition: Rendition) {
    const currentChapter = book.getChapter(rendition.location.start.cfi)?.data;
    if (currentChapter && currentChapter.prev) {
        await rendition.display(currentChapter.prev.data.nav.href);
    } else {
        await startOfBook(rendition);
    }
}

export async function startOfBook(rendition: Rendition) {
    await rendition.display(0);
}

export async function endOfBook(book: BookExtended, rendition: Rendition) {
    await rendition.display(book.getSpine().spineItems.length - 1);
    rendition.manager.scrollToBottom();
}
