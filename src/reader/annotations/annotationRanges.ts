import { createEffect, createSignal, Resource } from "solid-js";
import { AnnotationEntry } from "src/backend/library";

export interface AnnotationRange {
    entry: AnnotationEntry;
    range: Range;
}

export interface AnnotationHighlight {
    annotation: AnnotationRange;
    bounds: DOMRect;
    clientRects: DOMRect[];
}

export interface AnnotationNote {
    annotation: AnnotationRange;
    rect: DOMRect;
}

export function createAnnotationRanges(
    annotations: Resource<AnnotationEntry[]>
) {
    const [ranges, setRanges] = createSignal<AnnotationRange[]>([]);
    const [highlights, setHighlights] = createSignal<AnnotationHighlight[]>([]);
    const [notes, setNotes] = createSignal<AnnotationNote[]>([]);

    function loadRanges(sectionIndex: number, contentDocument: Document) {
        setRanges(
            annotations()
                .filter(
                    (annotation) =>
                        annotation.cfi.base.steps[1].index === sectionIndex
                )
                .map((entry) => ({
                    entry,
                    range: entry.cfi.toRange(contentDocument),
                }))
        );
    }
    function updateRects() {
        setHighlights(
            ranges()
                .filter((annotation) => !annotation.range.collapsed)
                .map((annotation) => ({
                    annotation,
                    bounds: annotation.range.getBoundingClientRect(),
                    clientRects: Array.from(annotation.range.getClientRects()),
                }))
        );
        setNotes(
            ranges()
                .filter((annotation) => annotation.range.collapsed)
                .map((annotation) => {
                    return {
                        annotation,
                        rect: annotation.range.getBoundingClientRect(),
                    };
                })
        );
    }

    createEffect(updateRects);

    return { highlights, notes, loadRanges, updateRects };
}
