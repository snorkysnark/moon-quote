import DefaultViewManager from "epubjs/lib/managers/default/index";

export default class CustomManager extends DefaultViewManager {
    next() {
        const delta = this.container.clientHeight;
        const newScrollTop = this.container.scrollTop + delta;

        if (newScrollTop < this.container.scrollHeight) {
            this.scrollBy(0, delta, true);
        } else {
            super.next();
        }
    }

    prev() {
        const delta = -this.container.clientHeight;

        if (this.container.scrollTop > 0) {
            this.scrollBy(0, delta, true);
        } else {
            super.prev();
        }
    }
}
