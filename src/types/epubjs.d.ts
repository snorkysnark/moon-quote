import "epubjs";

declare module "epubjs" {
    import type DefaultViewManager from "epubjs/lib/managers/default/index";

    export class Rendition {
        manager: DefaultViewManager;

        display(target?: string | number): Promise<void>;
    }
}
