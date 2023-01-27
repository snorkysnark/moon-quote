import { createResource, Resource, ResourceSource } from "solid-js";
import { AnnotationEntry, getAnnotationsForBook } from "src/backend/library";
import { sortAnnotations } from "src/util/cfi";
import * as backend from "src/backend/library";
import { EpubCFI } from "epubjs";

export interface AnnotationsResource {
    value: Resource<AnnotationEntry[]>;
    add: (annotation: AnnotationEntry) => Promise<void>;
    remove: (bookId: string, cfi: EpubCFI) => Promise<void>;
}

export function createAnnotations(
    idSource: ResourceSource<string>
): AnnotationsResource {
    const [annotations, { mutate: setAnnotations }] = createResource(
        idSource,
        (bookId) => {
            return getAnnotationsForBook(bookId);
        }
    );

    async function add(annotation: AnnotationEntry) {
        await backend.addAnnotation(annotation);
        setAnnotations((annotations) =>
            sortAnnotations([...annotations, annotation])
        );
    }

    async function remove(bookId: string, cfi: EpubCFI) {
        await backend.deleteAnnotation(bookId, cfi);
        setAnnotations((annotations) =>
            annotations.filter(
                (ann) => ann.bookId !== bookId || ann.cfi !== cfi
            )
        );
    }

    return {
        value: annotations,
        add,
        remove,
    };
}
