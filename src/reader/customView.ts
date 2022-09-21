import IframeView from "epubjs/lib/managers/views/iframe";

function stopEvent(event: Event) {
    event.preventDefault();
}

export default class CustomView extends IframeView {
    addListeners() {
        this.contents.document.addEventListener("keydown", stopEvent);
    }

    removeListeners() {
        this.contents.document.removeEventListener("keydown", stopEvent);
    }
}
