import DefaultViewManager from "epubjs/src/managers/default/index";

export default class MoonQuoteManager extends DefaultViewManager {
    private enablePointerEvents: boolean;

    constructor(options) {
        super(options);
        this.enablePointerEvents = true;
    }

    setPointerEventsEnabled(value: boolean) {
        this.enablePointerEvents = value;
        this.views.forEach((view) => {
            view.setPointerEventsEnabled(value);
        });
    }

    createView(section, forceRight) {
        const view = super.createView(section, forceRight);
        view.setPointerEventsEnabled(this.enablePointerEvents);
        return view;
    }
}
