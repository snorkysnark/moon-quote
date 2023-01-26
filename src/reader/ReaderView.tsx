import { Book } from "epubjs";
import EpubDisplay, { EpubDisplayController } from "./EpubDisplay";
import { makeFoldableToc, ToC } from "./ToC";
import { createStore } from "solid-js/store";
import { Accessor, createComputed, createSignal, Show } from "solid-js";
import { ImList2 } from "solid-icons/im";

// use:__ directives
import { resizableWidth } from "src/resizableWidth";
import { BookDatabaseEntry } from "src/backend/library";
import { Target } from "src/deeplink";
false && resizableWidth;

const navButtonClass = "flex-auto text-4xl";

export default function ReaderView(props: {
    bookEntry: BookDatabaseEntry;
    epub: Book;
    getExternalTarget?: Accessor<Target>;
}) {
    // Storing toc state outside of ToC component,
    // so that it persists when the panel is closed
    const [toc, setToc] = createStore({ items: null });
    createComputed(() =>
        setToc("items", makeFoldableToc(props.epub.navigation.toc, true))
    );

    let [sidePanel, setSidePanel] = createSignal(false);
    let [iframePointerEvents, setIframePointerEvents] = createSignal(true);

    // Location will be restored after resizing
    let locationLock: string = null;

    let displayController: EpubDisplayController;

    return (
        <div class="flex w-full h-full min-h-0">
            <div class="bg-gray-100 w-10 shrink-0">
                <button
                    class="w-full p-2"
                    classList={{ "bg-orange-200": sidePanel() }}
                    onClick={() => setSidePanel(!sidePanel())}
                >
                    <ImList2 class="w-full h-full" title="Table of Contents" />
                </button>
            </div>
            <Show when={sidePanel()}>
                <div
                    class="relative"
                    use:resizableWidth={{
                        initial: 500,
                        side: "right",
                        onResizeStart: () => setIframePointerEvents(false),
                        onResizeEnd: () => setIframePointerEvents(true),
                    }}
                >
                    <div class="bg-blue-200 h-full overflow-y-scroll border-r-slate-400 border-r-4">
                        <ToC
                            bookId={props.bookEntry.bookId}
                            items={toc.items}
                            setToc={setToc}
                            onHref={(href) => displayController?.display(href)}
                        />
                    </div>
                </div>
            </Show>
            <div class="flex-auto bg-gray-300 flex overflow-hidden">
                <button
                    class={navButtonClass}
                    onClick={() => displayController?.pageUpOrPrev()}
                >
                    ←
                </button>
                <div
                    class="h-full py-3 relative"
                    use:resizableWidth={{
                        initial: 800,
                        onResizeStart: () => {
                            setIframePointerEvents(false);
                            locationLock = displayController?.tryGetLocation();
                        },
                        onResize: () => {
                            if (locationLock) {
                                displayController?.display(locationLock);
                            }
                        },
                        onResizeEnd: () => {
                            setIframePointerEvents(true);
                            locationLock = null;
                        },
                    }}
                >
                    <div class="bg-white h-full shadow-lg shadow-neutral-500">
                        <EpubDisplay
                            bookEntry={props.bookEntry}
                            epub={props.epub}
                            pointerEvents={iframePointerEvents()}
                            controllerRef={(c) => (displayController = c)}
                            getExternalTarget={props.getExternalTarget}
                        />
                    </div>
                </div>
                <button
                    class={navButtonClass}
                    onClick={() => displayController?.pageDownOrNext()}
                >
                    →
                </button>
            </div>
        </div>
    );
}
