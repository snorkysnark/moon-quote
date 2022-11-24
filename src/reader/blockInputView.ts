import IframeView from "epubjs/src/managers/views/iframe";

function stopEvent(event: Event) {
    event.preventDefault();
}

export default class BlockInputView extends IframeView {
    addListeners() {
        this.contents.document.addEventListener("keydown", stopEvent);
        this.contents.document.addEventListener("contextmenu", stopEvent);
    }

    removeListeners() {
        this.contents.document.removeEventListener("keydown", stopEvent);
        this.contents.document.removeEventListener("contextmenu", stopEvent);
    }
}
