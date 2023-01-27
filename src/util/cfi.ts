import type { AnnotationEntry } from "src/backend/library";

export function sortAnnotations(annotations: AnnotationEntry[]) {
    annotations.sort((a, b) => a.cfi.compare(a.cfi, b.cfi));
    return annotations;
}
