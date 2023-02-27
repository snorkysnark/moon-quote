export { getBooks, deleteBook, uploadBook, loadEpub } from "./library/books";
export type { BookEntry } from "./library/books";

export {
    addAnnotation,
    deleteAnnotation,
    getAnnotationsForBook,
    getAnnotationsAll,
} from "./library/annotations";
export type {
    AnnotationData,
    AnnotationEntry,
    AnnotationFull,
} from "./library/annotations";
