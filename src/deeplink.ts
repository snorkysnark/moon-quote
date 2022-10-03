import { invoke } from "@tauri-apps/api";
import { listen } from "@tauri-apps/api/event";
import type { NavItem } from "epubjs";
import type { AnnotationDatabaseEntry, BookDatabaseEntry } from "./backend";

export interface GoToTarget {
    book: BookDatabaseEntry;
    target: Target;
}

export interface AnnotationTarget {
    type: "Annotation";
    value: AnnotationDatabaseEntry;
}

export interface RangeTarget {
    type: "Range";
    value: string;
}

export interface ChapterTarget {
    type: "Chapter";
    value: string;
}

export type Target = AnnotationTarget | RangeTarget | ChapterTarget;

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

export async function onAnnotationLink(callback: (link: GoToTarget) => void) {
    const initialLink: GoToTarget = await invoke("plugin:deeplink|initial_url");
    if (initialLink) {
        callback(initialLink);
    }

    const unlisten = await listen<GoToTarget>("goto_url", async (event) => {
        callback(event.payload);
    });
    return unlisten;
}
