import { invoke } from "@tauri-apps/api";
import { listen } from "@tauri-apps/api/event";
import type { AnnotationDatabaseEntry, BookDatabaseEntry } from "./backend";

export interface GoToAnnotation {
    book: BookDatabaseEntry;
    annotation: AnnotationDatabaseEntry;
}

export function makeAnnotationURL(annotation: AnnotationDatabaseEntry) {
    return `moonquote:///book/${annotation.bookId}/annotation/${annotation.cfi}`;
}

export async function onAnnotationLink(
    callback: (link: GoToAnnotation) => void
) {
    const initialLink: GoToAnnotation = await invoke(
        "plugin:deeplink|initial_url"
    );
    if (initialLink) {
        callback(initialLink);
    }

    const unlisten = await listen<GoToAnnotation>(
        "goto_annotation",
        async (event) => {
            callback(event.payload);
        }
    );
    return unlisten;
}
