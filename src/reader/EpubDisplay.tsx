import { Book, Contents, EpubCFI, Layout } from "epubjs";
import Section from "epubjs/types/section";
import { createBlobUrl, revokeBlobUrl } from "epubjs/src/utils/core";
import Mapping from "epubjs/src/mapping";
import { EVENTS } from "epubjs/src/utils/constants";
import {
    Accessor,
    createEffect,
    createMemo,
    createResource,
    createSignal,
    mergeProps,
    on,
    onCleanup,
    onMount,
    Show,
} from "solid-js";
import ScrollTarget from "./scrollTarget";
import SelectionOverlay from "./SelectionOverlay";
import { BookDatabaseEntry } from "src/backend/library";
import { Target } from "src/deeplink";

const SCROLL_STEP = 20;
const PAGE_MARGIN = 20;

// @ts-ignore: layout settings aren't actually needed
const MAPPING = new Mapping(new Layout({}));

export interface EpubDisplayController {
    display: (target: string) => void;
    pageUpOrPrev: () => void;
    pageDownOrNext: () => void;
    tryGetLocation: () => string;
}

export default function EpubDisplay(propsRaw: {
    bookEntry: BookDatabaseEntry;
    epub: Book;
    pointerEvents?: boolean;
    controllerRef?: (controller: EpubDisplayController) => void;
    getExternalTarget?: Accessor<Target>;
}) {
    const props = mergeProps({ pointerEvents: true }, propsRaw);

    const [section, setSection] = createSignal<Section>(null);
    createEffect(
        on(
            () => props.epub,
            () => {
                const target = props.getExternalTarget?.();
                if (target) {
                    visitExternalTarget(target);
                } else {
                    setSection(props.epub.spine.get(0));
                }
            }
        )
    );
    createEffect(() => {
        const target = props.getExternalTarget?.();
        if (target) visitExternalTarget(target);
    });
    function visitExternalTarget(target: Target) {
        switch (target.type) {
            case "Range":
                setSection(props.epub.spine.get(target.value));
                // Run after the side effects of setSection have been executed
                queueMicrotask(() => {
                    setScrollTarget({ type: "range", cfi: target.value });
                    setSelectionTarget(target.value);
                });
                break;
            case "Chapter":
                setSection(props.epub.spine.get(target.value));
                queueMicrotask(() => {
                    setScrollTarget({ type: "link", link: target.value });
                });
                break;
        }
    }

    const request = createMemo(() => (path: string) => props.epub.load(path));
    const [html] = createResource(
        () => (section() ? { request: request(), section: section() } : null),
        ({ request, section }) => {
            return section.render(request);
        }
    );
    const blobUrl = createMemo(() => {
        if (html()) {
            const url = createBlobUrl(html(), "application/xhtml+xml");
            onCleanup(() => {
                revokeBlobUrl(url);
            });
            return url;
        }
    });

    // True if iframe has been loaded, make sure that dependent code runs on reload
    const [loaded, setLoaded] = createSignal(true, { equals: false });
    // True if iframe size has beed defined
    const [sized, setSized] = createSignal(false);
    const [scrollTarget, setScrollTarget] = createSignal<ScrollTarget>(null);
    const [selectionTarget, setSelectionTarget] = createSignal<string>(null);
    createEffect(
        on(section, () => {
            setLoaded(false);
            setSized(false);
            setScrollTarget(null);
            setSelectionTarget(null);
            setSelectionRange(null);
        })
    );

    createEffect(() => {
        if (sized() && scrollTarget()) {
            // Can't use a signal here, since it would only update the dom after this effect
            scroller.style.scrollBehavior = "auto";

            const target = scrollTarget();
            switch (target.type) {
                case "side":
                    scroller.scrollLeft = 0;
                    if (target.side === "top") {
                        scroller.scrollTop = 0;
                    } else {
                        scroller.scrollTop = textHeight();
                    }
                    break;
                case "link":
                    // @ts-ignore
                    const location = contents().locationOf(target.link) as {
                        left: number;
                        top: number;
                    };
                    scroller.scrollLeft = location.left;
                    scroller.scrollTop = location.top;
                    break;
                case "range":
                    const rect = new EpubCFI(target.cfi, contents().cfiBase)
                        .toRange(iframe.contentDocument)
                        ?.getBoundingClientRect();
                    if (rect) {
                        scroller.scrollTop =
                            rect.y -
                            scroller.clientHeight / 2 +
                            rect.height / 2;
                    }
                    break;
            }

            scroller.style.scrollBehavior = "smooth";
            setScrollTarget(null);
        }
    });

    createEffect(() => {
        if (loaded() && selectionTarget()) {
            const range = new EpubCFI(selectionTarget()).toRange(
                iframe.contentDocument
            );
            if (range) {
                iframe.contentDocument.getSelection().removeAllRanges();
                iframe.contentDocument.getSelection().addRange(range);
                iframe.focus();
            }
            setSelectionTarget(null);
        }
    });

    // Not cleaning up contents/textHeight when section changes,
    // so that iframe doesn't flicker while loading new content
    const [contents, setContents] = createSignal<Contents>(null);
    const [textHeight, setTextHeight] = createSignal<number>(null);
    createEffect(
        on(contents, () => {
            if (contents()) {
                const lastContents = contents();
                const onResize = () => {
                    setTextHeight(lastContents.textHeight() + PAGE_MARGIN);
                    setSized(true);
                    setSelectionRect(selectionRange()?.getBoundingClientRect());
                };
                lastContents.on(EVENTS.CONTENTS.RESIZE, onResize);

                const onLinkClicked = (href: string) => {
                    const path = props.epub.path.relative(href);
                    display(path);
                };
                lastContents.on(EVENTS.CONTENTS.LINK_CLICKED, onLinkClicked);

                onCleanup(() => {
                    lastContents.off(EVENTS.CONTENTS.RESIZE, onResize);
                    lastContents.off(
                        EVENTS.CONTENTS.LINK_CLICKED,
                        onLinkClicked
                    );
                    lastContents.destroy();
                });
            }
        })
    );

    const [fontSize, setFontSize] = createSignal(16);
    createEffect(() => {
        if (loaded()) {
            iframe.contentDocument.body.style.fontSize = `${fontSize()}px`;

            // After changing the font size, the dimensions of the iframe aren't known
            // until they are recalculated and EVENTS.CONTENTS.RESIZE gets fired
            setSized(false);

            // If EVENTS.CONTENTS.RESIZE doesn't fire (can happen on a page with no text),
            // setSized(true) anyways after a (longer) timeout
            const waitForResizeTimeout = setTimeout(() => setSized(true), 2000);
            onCleanup(() => {
                clearTimeout(waitForResizeTimeout);
            });
        }
    });

    const [selectionRange, setSelectionRange] = createSignal<Range>(null);
    const [selectionRect, setSelectionRect] = createSignal<DOMRect>();
    createEffect(() => {
        setSelectionRect(selectionRange()?.getBoundingClientRect());
    });

    let scroller: HTMLDivElement;
    let iframe: HTMLIFrameElement;
    function onLoadIframe() {
        const iframeDoc = iframe.contentDocument;

        iframeDoc.body.style.overflow = "hidden";
        iframeDoc.body.style.margin = `${PAGE_MARGIN}px`;

        iframe.contentWindow.addEventListener("keydown", onKeyDown);
        iframeDoc.addEventListener("selectionchange", () => {
            const selection = iframe.contentWindow.getSelection();
            if (selection.type === "Range") {
                setSelectionRange(selection.getRangeAt(0));
            } else {
                setSelectionRange(null);
            }
        });

        setContents(
            new Contents(
                iframeDoc,
                iframeDoc.body,
                section().cfiBase,
                section().index
            )
        );
        setLoaded(true);
    }

    // @ts-ignore: wrong type signature for next()
    const nextSection = () => section()?.next() as Section;
    // @ts-ignore: wrong type signature for prev()
    const prevSection = () => section()?.prev() as Section;

    function toNextSection() {
        // @ts-ignore
        if (nextSection()) {
            setSection(nextSection());
            setScrollTarget({ type: "side", side: "top" });
        }
    }
    function toPrevSection() {
        if (prevSection()) {
            setSection(prevSection());
            setScrollTarget({ type: "side", side: "bottom" });
        }
    }
    function display(target: string) {
        const section = props.epub.spine.get(target);
        if (section) {
            setSection(section);
            setScrollTarget({ type: "link", link: target });
        }
    }
    function pageUp() {
        if (scroller.scrollTop > 0) {
            scroller.scrollTop -= scroller.clientHeight;
            return true;
        }
        return false;
    }
    function pageDown() {
        const newScrollTop = scroller.scrollTop + scroller.clientHeight;
        if (newScrollTop < scroller.scrollHeight) {
            scroller.scrollTop = newScrollTop;
            return true;
        }
        return false;
    }
    function scrollDown() {
        scroller.scrollTop += SCROLL_STEP;
    }
    function scrollUp() {
        scroller.scrollTop -= SCROLL_STEP;
    }
    function pageUpOrPrev() {
        if (!pageUp()) toPrevSection();
    }
    function pageDownOrNext() {
        if (!pageDown()) toNextSection();
    }
    function tryGetLocation(): string {
        if (!sized()) return null;

        return MAPPING.page(
            contents(),
            section().cfiBase,
            scroller.scrollTop,
            scroller.scrollTop + scroller.clientHeight
        )?.start;
    }
    function setFontSizeAnchored(value: number) {
        let anchor = tryGetLocation();

        setFontSize(value);
        if (anchor) {
            setScrollTarget({ type: "link", link: anchor });
        }
    }

    props.controllerRef?.({
        display,
        pageUpOrPrev,
        pageDownOrNext,
        tryGetLocation,
    });

    function onKeyDown(event: KeyboardEvent) {
        event.preventDefault();
        switch (event.key) {
            case "PageUp":
            case "ArrowLeft":
                pageUpOrPrev();
                break;
            case "PageDown":
            case "ArrowRight":
                pageDownOrNext();
                break;
            case "ArrowDown":
                scrollDown();
                break;
            case "ArrowUp":
                scrollUp();
                break;
            case "-":
                if (event.ctrlKey) setFontSizeAnchored(fontSize() - 1);
                break;
            case "=":
                if (event.ctrlKey) setFontSizeAnchored(fontSize() + 1);
                break;
        }
    }

    onMount(() => {
        window.addEventListener("keydown", onKeyDown);
        onCleanup(() => {
            window.removeEventListener("keydown", onKeyDown);
        });
    });

    return (
        <div
            class="w-full h-full overflow-scroll relative"
            style={{ "scroll-behavior": "smooth" }}
            ref={scroller}
            onWheel={(event) => {
                if (event.ctrlKey) {
                    event.preventDefault();
                    setFontSizeAnchored(
                        fontSize() + event.deltaY / Math.abs(event.deltaY)
                    );
                }
            }}
        >
            <Show when={selectionRect()}>
                <SelectionOverlay
                    bookId={props.bookEntry.bookId}
                    selectionRect={selectionRect()}
                    selectionRange={selectionRange()}
                    baseCfi={contents().cfiBase}
                />
            </Show>
            <Show when={blobUrl()}>
                <iframe
                    class="w-full overflow-hidden"
                    src={blobUrl()}
                    onLoad={onLoadIframe}
                    ref={iframe}
                    style={{
                        height: textHeight()
                            ? `max(${textHeight()}px, 100%)`
                            : "100%",
                        "pointer-events": props.pointerEvents ? "auto" : "none",
                    }}
                ></iframe>
            </Show>
        </div>
    );
}
