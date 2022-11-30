declare module "epubjs/src/managers/views/iframe" {
    import type { Contents } from "epubjs";

    export default class IframeView {
        constructor(section, options);

        contents: Contents;

        addListeners();
        removeListeners();
    }
}
