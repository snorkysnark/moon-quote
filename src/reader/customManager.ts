import DefaultViewManager from "epubjs/lib/managers/default/index";

export default class CustomManager extends DefaultViewManager {
    _onWheel: (event: WheelEvent) => void;

    addEventListeners() {
        super.addEventListeners();

        this._onWheel = this.onWheel.bind(this);
        this.container.addEventListener("wheel", this._onWheel);
    }

    removeEventListeners() {
        super.removeEventListeners();
        this.container.removeEventListener("wheel", this._onWheel);
        this._onWheel = undefined;
    }

    onWheel(event: WheelEvent) {
        this.scrollBy(0, event.deltaY, true);
    }

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
