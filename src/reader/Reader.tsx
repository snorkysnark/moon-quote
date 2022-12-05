import { createEffect, createResource, onMount, Show } from "solid-js";
import { BookDatabaseEntry, loadEpub } from "src/backend/library";
import EpubDisplay from "./EpubDisplay";

export default function Reader(props: {
    bookEntry: BookDatabaseEntry;
    onExit: () => void;
}) {
    const [epub] = createResource(props.bookEntry, (bookEntry) => {
        return loadEpub(bookEntry.epubPath);
    });

    return (
        <div class="flex flex-col h-screen select-none">
            <div class="bg-orange-400 h-10 flex">
                <button
                    class="bg-gray-200 text-2xl px-3 mr-2"
                    onClick={props.onExit}
                >
                    ←
                </button>
                <h1
                    class="text-2xl font-bold self-center flex-auto \
                    cursor-default overflow-hidden overflow-ellipsis whitespace-nowrap"
                >
                    {props.bookEntry.metaTitle}
                </h1>
            </div>
            <Show when={epub()}>
                <EpubDisplay epub={epub()} />
            </Show>
        </div>
    );
}
