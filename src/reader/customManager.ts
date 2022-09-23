import DefaultViewManager from "epubjs/lib/managers/default/index";
import type Section from "epubjs/types/section";
import { EVENTS } from "epubjs/lib/utils/constants";
import { defer, isNumber } from "epubjs/lib/utils/core";
import type View from "epubjs/types/managers/view";

export default class CustomManager extends DefaultViewManager {
    createView(section: Section, forceRight: boolean): View {
        const view = super.createView(section, forceRight);
        // Emit an event when view is resized
        view.on(EVENTS.VIEWS.RESIZED, (bounds) => {
            this.emit("viewResized", bounds);
        });
        return view;
    }

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

    display(section: Section, target: string | number) {
        var displaying = new defer();
        var displayed = displaying.promise;

        // Check if moving to target is needed
        if (target === section.href || isNumber(target)) {
            target = undefined;
        }

        // Check to make sure the section we want isn't already shown
        var visible = this.views.find(section);

        // View is already shown, just move to correct location in view
        if (visible && section && this.layout.name !== "pre-paginated") {
            let offset = visible.offset();

            if (this.settings.direction === "ltr") {
                this.scrollTo(offset.left, offset.top, true);
            } else {
                let width = visible.width();
                this.scrollTo(offset.left + width, offset.top, true);
            }

            if (target) {
                let offset = visible.locationOf(target);
                let width = visible.width();
                this.moveTo(offset, width);
            }

            displaying.resolve();
            return displayed;
        }

        // Hide all current views
        this.clear();

        let forceRight = false;
        if (
            this.layout.name === "pre-paginated" &&
            this.layout.divisor === 2 &&
            section.properties.includes("page-spread-right")
        ) {
            forceRight = true;
        }

        this.add(section, forceRight)
            .then(
                function (view: View) {
                    // Move to correct place within the section, if needed
                    if (target) {
                        view.on(EVENTS.VIEWS.RESIZED, () => {
                            // When the view size becomes defined, jump to location
                            let offset = view.locationOf(target as string);
                            let width = view.width();
                            this.moveTo(offset, width);
                        });
                    }
                }.bind(this),
                (err) => {
                    displaying.reject(err);
                }
            )
            .then(
                function () {
                    return this.handleNextPrePaginated(
                        forceRight,
                        section,
                        this.add
                    );
                }.bind(this)
            )
            .then(
                function () {
                    this.views.show();

                    displaying.resolve();
                }.bind(this)
            );
        return displayed;
    }

    scrollToBottom() {
        this.scrollTo(0, this.container.scrollHeight, true);
    }
}
