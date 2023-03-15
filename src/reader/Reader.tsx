import { Accessor, createResource, Show } from "solid-js";
import { BookEntry, loadEpub } from "src/backend/library";
import Loading from "src/decor/Loading";
import { DeeplinkTargetLocation } from "src/backend/deeplink";
import { createAnnotations } from "./annotations";
import ReaderView from "./ReaderView";

export default function Reader(props: {
    bookEntry: BookEntry;
    getExternalTarget?: Accessor<DeeplinkTargetLocation>;
    onExit?: () => void;
}) {
    const [epub] = createResource(
        () => props.bookEntry,
        (bookEntry) => {
            return loadEpub(bookEntry.epubPath);
        }
    );
    const annotations = createAnnotations(() => props.bookEntry.bookId);

    return (
        <div class="flex flex-col h-screen select-none">
            <div class="bg-orange-400 h-10 flex">
                <button
                    class="bg-gray-200 text-2xl px-3 mr-2"
                    onClick={() => props.onExit?.()}
                >
                    ←
                </button>
                <h1
                    class="text-2xl font-bold self-center flex-auto \
                        cursor-default overflow-hidden overflow-ellipsis whitespace-nowrap"
                >
                    {props.bookEntry.metadata.title}
                </h1>
            </div>
            <Show
                when={
                    epub.state === "ready" &&
                    annotations.value.state === "ready"
                }
                fallback={<Loading />}
            >
                <ReaderView
                    bookEntry={props.bookEntry}
                    annotations={annotations}
                    epub={epub()}
                    getExternalTarget={props.getExternalTarget}
                />
            </Show>
        </div>
    );
}
