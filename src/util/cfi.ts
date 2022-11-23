import { EpubCFI } from "epubjs";
import type { AnnotationDatabaseEntry } from "src/backend/library";

export function sortAnnotations(annotations: AnnotationDatabaseEntry[]) {
    annotations.sort((a, b) => EpubCFI.compare(a.cfi, b.cfi));
    return annotations;
}
