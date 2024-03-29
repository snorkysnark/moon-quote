import { Book } from "epubjs";
import EpubDisplay, { EpubDisplayController } from "./EpubDisplay";
import { makeFoldableToc, ToC } from "./ToC";
import { createStore } from "solid-js/store";
import {
    Accessor,
    createComputed,
    createEffect,
    createSignal,
    For,
    Match,
    Show,
    Switch,
    ValidComponent,
} from "solid-js";
import { ImList2 } from "solid-icons/im";
import { HiSolidAnnotation } from "solid-icons/hi";
import { BookEntry } from "src/backend/library";
import { DeeplinkTargetLocation } from "src/backend/deeplink";
import { createStorageSignal } from "src/signals/localstorage";
import { AnnotationsResource } from "./annotations";
import AnnotationList from "./AnnotationList";
import ResizeHandle from "src/ResizeHandle";
import { Dynamic } from "solid-js/web";

// use:__ directives
import { contextMenu } from "src/contextMenu";
false && contextMenu;

type SidePanelNames = "toc" | "annotations";
interface SidePanelButton {
    panel: SidePanelNames;
    icon: ValidComponent;
    alt: string;
}

const sidePanelButtons: SidePanelButton[] = [
    { panel: "toc", icon: ImList2, alt: "Table of Contents" },
    { panel: "annotations", icon: HiSolidAnnotation, alt: "Annotations" },
];

export default function ReaderView(props: {
    bookEntry: BookEntry;
    annotations: AnnotationsResource;
    epub: Book;
    getExternalTarget?: Accessor<DeeplinkTargetLocation>;
}) {
    // Storing toc state outside of ToC component,
    // so that it persists when the panel is closed
    const [toc, setToc] = createStore({ items: null });
    createComputed(() =>
        setToc("items", makeFoldableToc(props.epub.navigation.toc, true))
    );

    const [currentSidePanel, setCurrentSidePanel] =
        createSignal<SidePanelNames>(null);
    function toggleSidePanel(name: SidePanelNames) {
        setCurrentSidePanel((current) => (current === name ? null : name));
    }
    const [sidePanelWidth, setSidePanelWidth] = createSignal(500);
    let [sidePanelRight, setSidePanelRight] = createStorageSignal(
        "sidePanelRight",
        false
    );

    const [pageWidth, setPageWidth] = createSignal(800);
    const pageResizeEvents = {
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
    };
    const [iframePointerEvents, setIframePointerEvents] = createSignal(true);
    // Location will be restored after resizing
    let locationLock: string = null;

    const [selectedAnnotationId, setSelectedAnnotationId] =
        createSignal<number>();

    let displayController: EpubDisplayController;

    const [passedTarget, setPassedTarget] = createSignal<DeeplinkTargetLocation>(null);
    createEffect(() => {
        const target = props.getExternalTarget?.();
        if (target) {
            if (target.type === "Annotation") {
                setCurrentSidePanel("annotations");
                setSelectedAnnotationId(target.value.annotationId);
            }
            setPassedTarget(target);
        }
    });

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
                <For each={sidePanelButtons}>
                    {(button) => (
                        <button
                            class="w-full p-2"
                            classList={{
                                "bg-orange-200":
                                    currentSidePanel() === button.panel,
                            }}
                            onClick={() => toggleSidePanel(button.panel)}
                        >
                            <Dynamic
                                component={button.icon}
                                class="w-full h-full"
                                title={button.alt}
                            />
                        </button>
                    )}
                </For>
            </div>
            <Show when={currentSidePanel()}>
                <div style={{ width: `${sidePanelWidth()}px` }}>
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
                                    selectedId={selectedAnnotationId()}
                                    onClick={(annotation) => {
                                        if (displayController) {
                                            displayController.displayAnnotation(
                                                annotation
                                            );
                                            setSelectedAnnotationId(
                                                annotation.annotationId
                                            );
                                        }
                                    }}
                                />
                            </Match>
                        </Switch>
                    </div>
                </div>
                <ResizeHandle
                    width={sidePanelWidth()}
                    setWidth={setSidePanelWidth}
                    deltaX={sidePanelRight() ? -1 : 1}
                    class="h-full w-2 bg-gray-400 cursor-col-resize"
                    onResizeStart={() => setIframePointerEvents(false)}
                    onResizeEnd={() => setIframePointerEvents(true)}
                />
            </Show>
            <div class="flex-auto bg-gray-300 flex overflow-hidden">
                <button
                    class="navButton"
                    onClick={() => displayController?.pageUpOrPrev()}
                >
                    ←
                </button>
                <div
                    class="h-full py-3 relative"
                    style={{ width: `${pageWidth()}px` }}
                >
                    <ResizeHandle
                        width={pageWidth()}
                        setWidth={setPageWidth}
                        deltaX={-2}
                        class="resizeHandle resizeHandleLeft"
                        {...pageResizeEvents}
                    />
                    <div class="bg-white h-full shadow-lg shadow-neutral-500">
                        <EpubDisplay
                            bookEntry={props.bookEntry}
                            annotations={props.annotations}
                            selectedAnnotationId={selectedAnnotationId()}
                            onClickAnnotation={(annotation) => {
                                setSelectedAnnotationId(
                                    annotation?.annotationId
                                );
                                if (annotation) {
                                    setCurrentSidePanel("annotations");
                                }
                            }}
                            epub={props.epub}
                            pointerEvents={iframePointerEvents()}
                            controllerRef={(c) => (displayController = c)}
                            getExternalTarget={() => {
                                const target = passedTarget();
                                setPassedTarget(null);
                                return target;
                            }}
                        />
                    </div>
                    <ResizeHandle
                        width={pageWidth()}
                        setWidth={setPageWidth}
                        deltaX={2}
                        class="resizeHandle resizeHandleRight"
                        {...pageResizeEvents}
                    />
                </div>
                <button
                    class="navButton"
                    onClick={() => displayController?.pageDownOrNext()}
                >
                    →
                </button>
            </div>
        </div>
    );
}
