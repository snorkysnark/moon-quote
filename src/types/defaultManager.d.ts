declare module "epubjs/lib/managers/default/index" {
    export default class DefaultViewManager {
        container: HTMLElement;

        addEventListeners();
        removeEventListeners();
        next();
        prev();
        scrollBy(x: number, y: number, silent: boolean);
    }
}
