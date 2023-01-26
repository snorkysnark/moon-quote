import { EpubCFI } from "epubjs";
import { createEffect, createSignal } from "solid-js";

export interface AnnotationData {
    cfi: EpubCFI;
    color: string;
    comment?: string;
}

export interface AnnotationRange {
    data: AnnotationData;
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

export function createAnnotations() {
    const [annotationData, setAnnotationData] = createSignal<AnnotationData[]>(
        []
    );
    const [ranges, setRanges] = createSignal<AnnotationRange[]>([]);
    const [highlights, setHighlights] = createSignal<AnnotationHighlight[]>([]);
    const [flags, setFlags] = createSignal<AnnotationNote[]>([]);

    function add(annotation: AnnotationData) {
        setAnnotationData((annotations) => [...annotations, annotation]);
    }
    function loadRanges(sectionIndex: number, contentDocument: Document) {
        setRanges(
            annotationData()
                .filter(
                    (annotation) =>
                        annotation.cfi.base.steps[1].index === sectionIndex
                )
                .map((data) => ({
                    data,
                    range: data.cfi.toRange(contentDocument),
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
        setFlags(
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

    return { highlights, flags, add, loadRanges, updateRects };
}
