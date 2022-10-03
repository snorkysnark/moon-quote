import { invoke } from "@tauri-apps/api";
import { listen } from "@tauri-apps/api/event";
import type { NavItem } from "epubjs";
import type { AnnotationDatabaseEntry, BookDatabaseEntry } from "./backend";

export interface GoToAnnotation {
    book: BookDatabaseEntry;
    annotation: AnnotationDatabaseEntry | string;
}

export function makeAnnotationURL(annotation: AnnotationDatabaseEntry) {
    const bookId = encodeURIComponent(annotation.bookId);
    const cfi = encodeURIComponent(annotation.cfi);
    return `moonquote:///book/${bookId}/annotation/${cfi}`;
}

export function makeChapterURL(book: BookDatabaseEntry, navItem: NavItem) {
    const bookId = encodeURIComponent(book.bookId);
    const href = encodeURIComponent(navItem.href);
    return `moonquote:///book/${bookId}/nav/${href}`;
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
