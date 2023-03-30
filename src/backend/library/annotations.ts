import { EpubCFI } from "epubjs";
import { Accessor, createSignal } from "solid-js";
import { sortAnnotations } from "src/util/cfi";
import * as raw from "./raw/annotations";

export {
    deleteAnnotation,
    setAnnotationComment,
    getAnnotationsAll,
} from "./raw/annotations";
export type {
    AnnotationData,
    AnnotationFull,
    AnnotationEntry as AnnotationEntryRaw,
} from "./raw/annotations";

export interface AnnotationEntry {
    annotationId: number;
    bookId: string;
    cfi: EpubCFI;
    textContent: string;
    color: string;
    comment: Accessor<string>;
    setComment: (value: string) => void;
    collapsed: boolean;
}

function annotationFromRaw(annotation: raw.AnnotationEntry): AnnotationEntry {
    const [comment, setComment] = createSignal(annotation.comment);

    return {
        ...annotation,
        cfi: new EpubCFI(annotation.cfi),
        comment: comment,
        setComment: (value: string) => {
            value = value.trim();
            if (value === "") value = null;

            setComment(value);
            raw.setAnnotationComment(annotation.annotationId, value);
        },
    };
}

export async function getAnnotationsForBook(
    bookId: string
): Promise<AnnotationEntry[]> {
    return sortAnnotations(
        (await raw.getAnnotationsForBook(bookId)).map(annotationFromRaw)
    );
}

export async function addAnnotation(
    data: raw.AnnotationData
): Promise<AnnotationEntry> {
    return annotationFromRaw(await raw.addAnnotation(data));
}
