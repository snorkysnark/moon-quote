import { EpubCFI } from "epubjs";
import { sortAnnotations } from "src/util/cfi";
import * as raw from "./raw/annotations";

export interface AnnotationEntry {
    annotationId: number;
    bookId: string;
    cfi: EpubCFI;
    textContent: string;
    color: string;
    comment: string;
    collapsed: boolean;
}

export async function getAnnotationsForBook(
    bookId: string
): Promise<AnnotationEntry[]> {
    return sortAnnotations(
        (await raw.getAnnotationsForBook(bookId)).map((annotation) => ({
            ...annotation,
            cfi: new EpubCFI(annotation.cfi),
        }))
    );
}
