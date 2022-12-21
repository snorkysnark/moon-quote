import { convertFileSrc } from "@tauri-apps/api/tauri";
import { createMemo, Show } from "solid-js";
import { BookDatabaseEntry } from "src/backend/library";

export default function LibraryBook(props: {
    entry: BookDatabaseEntry;
    onOpen?: (entry: BookDatabaseEntry) => void;
    onDelete?: (entry: BookDatabaseEntry) => void;
}) {
    const coverUrl = createMemo(() =>
        props.entry.coverPath ? convertFileSrc(props.entry.coverPath) : null
    );

    return (
        <button class="bg-gray-100" onClick={() => props.onOpen?.(props.entry)}>
            <Show when={coverUrl()}>
                <img
                    class="h-52 object-contain mx-auto"
                    src={coverUrl()}
                    alt={props.entry.metaTitle}
                    draggable={false}
                />
            </Show>
            <p class="text-sm">{props.entry.metaTitle}</p>
        </button>
    );
}
