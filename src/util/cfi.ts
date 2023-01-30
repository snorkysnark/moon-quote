import type { AnnotationEntry } from "src/backend/library";

export function sortAnnotations(annotations: AnnotationEntry[]) {
    annotations.sort((a, b) =>
        a.cfi.compare(a.cfi.toString(), b.cfi.toString())
    );
    return annotations;
}
