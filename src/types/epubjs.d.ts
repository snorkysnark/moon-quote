import "epubjs";

declare module "epubjs" {
    import type CustomManager from "src/reader/customManager";

    export class Rendition {
        manager: CustomManager;

        display(target?: string | number): Promise<void>;
    }
}
