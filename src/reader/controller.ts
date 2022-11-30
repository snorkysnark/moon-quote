import type { Rendition } from "epubjs";

export default class ReaderController {
    private rendition: Rendition;

    constructor(rendition: Rendition) {
        this.rendition = rendition;
    }

    next() {
        this.rendition.next();
    }
    prev() {
        this.rendition.prev();
    }
    nextPage() {
        const container: HTMLElement = this.rendition.manager.container;
        const screenHeight = container.clientHeight;
        const newScrollTop = container.scrollTop + screenHeight;

        if (newScrollTop < container.scrollHeight) {
            this.rendition.manager.scrollBy(0, screenHeight, false);
        } else {
            this.rendition.next();
        }
    }
    prevPage() {
        const container: HTMLElement = this.rendition.manager.container;
        const screenHeight = container.clientHeight;

        if (container.scrollTop > 0) {
            this.rendition.manager.scrollBy(0, -screenHeight, false);
        } else {
            this.rendition.prev();
        }
    }
    resize(width: string | number, height: string | number) {
        // @ts-ignore: wrong type annotations
        this.rendition.resize(width, height);
    }
    setPointerEventsEnabled(value: boolean) {
        this.rendition.manager.setPointerEventsEnabled(value);
    }
}
