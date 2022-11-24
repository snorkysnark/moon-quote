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
    resize(width: string | number, height: string | number) {
        // @ts-ignore: wrong type annotations
        this.rendition.resize(width, height);
    }
}
