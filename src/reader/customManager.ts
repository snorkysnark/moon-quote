import DefaultViewManager from "epubjs/lib/managers/default/index";
import type Section from "epubjs/types/section";
import { EVENTS } from "epubjs/lib/utils/constants";

export default class CustomManager extends DefaultViewManager {
    prepend(section: Section, forceRight: boolean) {
        var view = this.createView(section, forceRight);

        view.on(EVENTS.VIEWS.RESIZED, () => {
            // in DefaultViewManager's code this.counter(bounds) is called,
            // but we need to jump to the bottom, not to compensate for resizing
            // As far as I'm aware this event is only called once
            this.scrollToBottom();
        });

        this.views.prepend(view);

        view.onDisplayed = this.afterDisplayed.bind(this);
        view.onResize = this.afterResized.bind(this);

        view.on(EVENTS.VIEWS.AXIS, (axis) => {
            this.updateAxis(axis);
        });

        view.on(EVENTS.VIEWS.WRITING_MODE, (mode) => {
            this.updateWritingMode(mode);
        });

        return view.display(this.request);
    }

    scrollToBottom() {
        this.scrollTo(0, this.container.scrollHeight, true);
    }
}
