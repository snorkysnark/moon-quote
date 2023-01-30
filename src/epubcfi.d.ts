import "epubjs";
import { EpubCFIComponent } from "epubjs/types/epubcfi";

declare module "epubjs" {
    export interface EpubCFI {
        path: EpubCFIComponent;
        start: EpubCFIComponent;
        end: EpubCFIComponent;
    }
}
