import { EpubCFI } from "epubjs";
import type { AnnotationDatabaseEntry } from "src/backend/library";

export const compareCfi = (new EpubCFI()).compare;

export function sortAnnotations(annotations: AnnotationDatabaseEntry[]) {
    annotations.sort((a, b) => compareCfi(a.cfi, b.cfi));
    return annotations;
}
