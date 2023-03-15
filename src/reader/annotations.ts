import { createResource, Resource, ResourceSource } from "solid-js";
import {
    AnnotationEntry,
    AnnotationData,
    getAnnotationsForBook,
} from "src/backend/library";
import { sortAnnotations } from "src/util/cfi";
import * as backend from "src/backend/library";

export interface AnnotationsResource {
    value: Resource<AnnotationEntry[]>;
    add: (annotation: AnnotationData) => Promise<void>;
    remove: (annotationId: number) => Promise<void>;
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

    async function add(annotationData: AnnotationData) {
        const annotation = await backend.addAnnotation(annotationData);
        setAnnotations((annotations) =>
            sortAnnotations([...annotations, annotation])
        );
    }

    async function remove(annotationId: number) {
        await backend.deleteAnnotation(annotationId);
        setAnnotations((annotations) =>
            annotations.filter((ann) => ann.annotationId != annotationId)
        );
    }

    return {
        value: annotations,
        add,
        remove,
    };
}
