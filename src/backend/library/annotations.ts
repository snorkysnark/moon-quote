import { EpubCFI } from "epubjs";
import { sortAnnotations } from "src/util/cfi";
import { BookEntry } from "./books";
import * as raw from "./raw/annotations";

export { deleteAnnotation } from "./raw/annotations";
export type {
    AnnotationData,
    AnnotationEntry as AnnotationEntryRaw,
} from "./raw/annotations";

export interface AnnotationEntry {
    annotationId: number;
    bookId: string;
    cfi: EpubCFI;
    textContent: string;
    color: string;
    comment: string;
    collapsed: boolean;
}

export interface AnnotationFull {
    book: BookEntry;
    annotation: AnnotationEntry;
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

export async function getAnnotationsAll(): Promise<AnnotationFull[]> {
    return (await raw.getAnnotationsAll()).map(({ book, annotation }) => ({
        book,
        annotation: {
            ...annotation,
            cfi: new EpubCFI(annotation.cfi),
        },
    }));
}

export async function addAnnotation(
    data: raw.AnnotationData
): Promise<AnnotationEntry> {
    const annotation = await raw.addAnnotation(data);
    return {
        ...annotation,
        cfi: new EpubCFI(annotation.cfi),
    };
}
