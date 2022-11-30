import IframeView from "epubjs/src/managers/views/iframe";

function stopEvent(event: Event) {
    event.preventDefault();
}

export default class MoonQuoteView extends IframeView {
    private enablePointerEvents: boolean;

    constructor(section, options) {
        super(section, options);
        this.enablePointerEvents = true;
    }

    setPointerEventsEnabled(value: boolean) {
        this.enablePointerEvents = value;
        if (this.iframe) {
            this.iframe.style.pointerEvents = this.enablePointerEvents
                ? "auto"
                : "none";
        }
    }

    create() {
        const iframe = super.create();
        iframe.style.pointerEvents = this.enablePointerEvents
            ? "auto"
            : "none";

        return iframe;
    }

    addListeners() {
        this.contents.document.addEventListener("keydown", stopEvent);
        this.contents.document.addEventListener("contextmenu", stopEvent);
    }

    removeListeners() {
        this.contents.document.removeEventListener("keydown", stopEvent);
        this.contents.document.removeEventListener("contextmenu", stopEvent);
    }
}
