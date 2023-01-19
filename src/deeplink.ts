import { invoke } from "@tauri-apps/api";
import { listen } from "@tauri-apps/api/event";
import { BookDatabaseEntry } from "./backend/library";

export interface GoToTarget {
    book: BookDatabaseEntry;
    target: Target;
}

export interface RangeTarget {
    type: "Range";
    value: string;
}

export interface ChapterTarget {
    type: "Chapter";
    value: string;
}

export type Target = RangeTarget | ChapterTarget;

export function makeAnnotationURL(bookId: string, cfi: string) {
    return `moonquote:///book/${encodeURIComponent(
        bookId
    )}/annotation/${encodeURIComponent(cfi)}`;
}

export function makeChapterURL(bookId: string, href: string) {
    return `moonquote:///book/${encodeURIComponent(
        bookId
    )}/nav/${encodeURIComponent(href)}`;
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
