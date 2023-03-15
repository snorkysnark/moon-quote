import { convertFileSrc } from "@tauri-apps/api/tauri";
import { createMemo, Show } from "solid-js";
import { BookEntry } from "src/backend/library";
import { openFolder } from "src/backend/system";

// use:__ directives
import { contextMenu } from "src/contextMenu";
false && contextMenu;

export default function LibraryBook(props: {
    entry: BookEntry;
    onOpen?: (entry: BookEntry) => void;
    onDelete?: (entry: BookEntry) => void;
}) {
    const coverUrl = createMemo(() =>
        props.entry.coverPath ? convertFileSrc(props.entry.coverPath) : null
    );

    return (
        <button
            class="bg-gray-100"
            onClick={() => props.onOpen?.(props.entry)}
            use:contextMenu={[
                {
                    label: "Open Folder",
                    action: () => openFolder(props.entry.epubPath),
                },
                {
                    label: "Delete",
                    action: () => props.onDelete?.(props.entry),
                },
            ]}
        >
            <Show when={coverUrl()}>
                <img
                    class="h-52 object-contain mx-auto"
                    src={coverUrl()}
                    alt={props.entry.metadata.title}
                    draggable={false}
                />
            </Show>
            <p class="text-sm">{props.entry.metadata.title}</p>
        </button>
    );
}
