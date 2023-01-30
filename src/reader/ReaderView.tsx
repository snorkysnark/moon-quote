import { Book } from "epubjs";
import EpubDisplay, { EpubDisplayController } from "./EpubDisplay";
import { makeFoldableToc, ToC } from "./ToC";
import { createStore } from "solid-js/store";
import {
    Accessor,
    createComputed,
    createSignal,
    Match,
    Show,
    Switch,
} from "solid-js";
import { ImList2 } from "solid-icons/im";
import { HiSolidAnnotation } from "solid-icons/hi";
import { BookDatabaseEntry } from "src/backend/library";
import { Target } from "src/deeplink";

// use:__ directives
import { resizableWidth } from "src/resizableWidth";
import { contextMenu } from "src/contextMenu";
import { createStorageSignal } from "src/localstorage";
import { AnnotationsResource } from "./annotations";
import AnnotationList from "./AnnotationList";
false && resizableWidth && contextMenu;

const navButtonClass = "flex-auto text-4xl";

export default function ReaderView(props: {
    bookEntry: BookDatabaseEntry;
    annotations: AnnotationsResource;
    epub: Book;
    getExternalTarget?: Accessor<Target>;
}) {
    // Storing toc state outside of ToC component,
    // so that it persists when the panel is closed
    const [toc, setToc] = createStore({ items: null });
    createComputed(() =>
        setToc("items", makeFoldableToc(props.epub.navigation.toc, true))
    );

    const [currentSidePanel, setCurrentSidePanel] = createSignal<string>(null);
    const [iframePointerEvents, setIframePointerEvents] = createSignal(true);

    function toggleSidePanel(name: string) {
        setCurrentSidePanel((current) => (current === name ? null : name));
    }

    let [sidePanelRight, setSidePanelRight] = createStorageSignal(
        "sidePanelRight",
        false
    );

    // Location will be restored after resizing
    let locationLock: string = null;

    let displayController: EpubDisplayController;

    return (
        <div
            class="flex w-full h-full min-h-0"
            classList={{ "flex-row-reverse": sidePanelRight() }}
        >
            <div
                class="bg-gray-100 w-10 shrink-0"
                use:contextMenu={[
                    {
                        label: "Left Side",
                        disabled: !sidePanelRight(),
                        action: () => setSidePanelRight(false),
                    },
                    {
                        label: "Right Side",
                        disabled: sidePanelRight(),
                        action: () => setSidePanelRight(true),
                    },
                ]}
            >
                <button
                    class="w-full p-2"
                    classList={{
                        "bg-orange-200": currentSidePanel() === "toc",
                    }}
                    onClick={() => toggleSidePanel("toc")}
                >
                    <ImList2 class="w-full h-full" title="Table of Contents" />
                </button>
                <button
                    class="w-full p-2"
                    classList={{
                        "bg-orange-200": currentSidePanel() === "annotations",
                    }}
                    onClick={() => toggleSidePanel("annotations")}
                >
                    <HiSolidAnnotation
                        class="w-full h-full"
                        title="Annotations"
                    />
                </button>
            </div>
            <Show when={currentSidePanel()}>
                <div
                    class="relative"
                    use:resizableWidth={{
                        initial: 500,
                        side: sidePanelRight() ? "left" : "right",
                        onResizeStart: () => setIframePointerEvents(false),
                        onResizeEnd: () => setIframePointerEvents(true),
                    }}
                >
                    <div class="bg-blue-200 h-full overflow-y-scroll">
                        <Switch>
                            <Match when={currentSidePanel() === "toc"}>
                                <ToC
                                    bookId={props.bookEntry.bookId}
                                    items={toc.items}
                                    setToc={setToc}
                                    onHref={(href) =>
                                        displayController?.display(href)
                                    }
                                />
                            </Match>
                            <Match when={currentSidePanel() === "annotations"}>
                                <AnnotationList
                                    annotations={props.annotations}
                                    onClick={(annotation) => {
                                        displayController?.displayAnnotation(
                                            annotation
                                        );
                                    }}
                                />
                            </Match>
                        </Switch>
                    </div>
                </div>
                <div class="h-full w-2 bg-gray-400"></div>
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
                            annotations={props.annotations}
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
