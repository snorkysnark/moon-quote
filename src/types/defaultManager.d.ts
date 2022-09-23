
declare module "epubjs/lib/managers/default/index" {
    import type Section from "epubjs/types/section";
    import type View from "epubjs/types/managers/view";
    import type { Layout } from "epubjs";

    export default class DefaultViewManager {
        container: HTMLElement;
        views: Views;
        request: Function;
        layout: any;
        settings: any;

        addEventListeners();
        removeEventListeners();
        next();
        prev();
        prepend(section: Section, forceRight: boolean);
        counter(bounds);
        createView(section: Section, forceRight: boolean): View;
        afterDisplayed(view: View);
        afterResized(view: View);
        updateAxis(axis, forceUpdate?);
        updateWritingMode(mode);
        display(section: Section, target: string | number);
        moveTo(offset: { top: number, left: number }, width: number);
        clear();
        add(section: Section, forceRight: boolean);

        scrollBy(x: number, y: number, silent: boolean);
        scrollTo(x: number, y: number, silent: boolean);
    }
}
