declare module "epubjs/lib/managers/views/iframe" {
    import type { Contents } from "epubjs";

    export default class IframeView {
        contents: Contents;
        iframe: HTMLIFrameElement;

        addListeners();
        removeListeners();
    }
}