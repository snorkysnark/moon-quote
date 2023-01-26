import { EpubCFI } from "epubjs";
import { createEffect, createSignal } from "solid-js";

export interface AnnotationHighlight {
    range: Range;
    clientRects: DOMRect[];
}

export interface AnnotationFlag {
    range: Range;
    rect: DOMRect;
}

export function createAnnotations() {
    const [cfis, setCfis] = createSignal<EpubCFI[]>([]);
    const [ranges, setRanges] = createSignal<Range[]>([]);
    const [highlights, setHighlights] = createSignal<AnnotationHighlight[]>([]);
    const [flags, setFlags] = createSignal<AnnotationFlag[]>([]);

    function add(cfi: EpubCFI) {
        setCfis((cfis) => [...cfis, cfi]);
    }
    function loadRanges(sectionIndex: number, contentDocument: Document) {
        setRanges(
            cfis()
                .filter((cfi) => cfi.base.steps[1].index === sectionIndex)
                .map((cfi) => cfi.toRange(contentDocument))
        );
    }
    function updateRects() {
        setHighlights(
            ranges()
                .filter((range) => !range.collapsed)
                .map((range) => {
                    return {
                        range,
                        clientRects: Array.from(range.getClientRects()),
                    };
                })
        );
        setFlags(
            ranges()
                .filter((range) => range.collapsed)
                .map((range) => {
                    return {
                        range,
                        rect: range.getBoundingClientRect(),
                    };
                })
        );
    }

    createEffect(updateRects);

    return { highlights, flags, add, loadRanges, updateRects };
}
