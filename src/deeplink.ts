import { invoke } from "@tauri-apps/api";
import * as backend from "./backend";
import type { AnnotationDatabaseEntry, BookDatabaseEntry } from "./backend";
import { listen } from "@tauri-apps/api/event";

interface GoToAnnotationIds {
    book_id: number;
    annotation_id: number;
}

export interface GoToAnnotation {
    book: BookDatabaseEntry;
    annotation: AnnotationDatabaseEntry;
}

function initialAnnotationLink(): Promise<GoToAnnotationIds> {
    return invoke("initial_annotation_link");
}

async function loadLink(idsLink: GoToAnnotationIds): Promise<GoToAnnotation> {
    const [book, annotation] = await Promise.all([
        backend.getBook(idsLink.book_id),
        backend.getAnnotation(idsLink.annotation_id),
    ]);
    return { book, annotation };
}

export async function onAnnotationLink(
    callback: (link: GoToAnnotation) => void
) {
    const initialLink = await initialAnnotationLink();
    if (initialLink) {
        callback(await loadLink(initialLink));
    }

    const unlisten = listen<GoToAnnotationIds>(
        "goto_annotation",
        async (event) => {
            callback(await loadLink(event.payload));
        }
    );
    return unlisten;
}
