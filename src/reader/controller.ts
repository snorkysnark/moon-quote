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
}
