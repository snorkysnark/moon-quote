import { Book, Contents } from "epubjs";
import Section from "epubjs/types/section";
import { createBlobUrl, revokeBlobUrl } from "epubjs/src/utils/core";
import { EVENTS } from "epubjs/src/utils/constants";
import {
    createEffect,
    createMemo,
    createResource,
    createSignal,
    on,
    onCleanup,
    onMount,
    Show,
} from "solid-js";
import ScrollTarget from "./scrollTarget";
import { EventListener } from "src/util/events";

const SCROLL_STEP = 20;
const PAGE_MARGIN = 20;

export default function EpubDisplay(props: {
    epub: Book;
    nextListener?: EventListener<void>;
    prevListener?: EventListener<void>;
    displayListener?: EventListener<string>;
}) {
    const [section, setSection] = createSignal<Section>(null);
    // Reset to first section when book changes
    createEffect(
        on(
            () => props.epub,
            () => {
                setSection(props.epub.spine.get(0));
            }
        )
    );

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

    const [ready, setReady] = createSignal(false);
    const [scrollTarget, setScrollTarget] = createSignal<ScrollTarget>(null);
    createEffect(
        on(section, () => {
            setReady(false);
            setScrollTarget(null);
        })
    );

    createEffect(() => {
        if (ready() && scrollTarget()) {
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
            }

            scroller.style.scrollBehavior = "smooth";
            setScrollTarget(null);
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
                    setReady(true);
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

    let scroller: HTMLDivElement;
    let iframe: HTMLIFrameElement;
    function onLoadIframe() {
        const iframeDoc = iframe.contentDocument;
        iframeDoc.body.style.overflow = "hidden";
        iframeDoc.body.style.margin = `${PAGE_MARGIN}px`;
        iframeDoc.body.style.fontSize = `${fontSize()}px`;

        iframe.contentWindow.addEventListener("keydown", onKeyDown);

        setContents(
            new Contents(
                iframeDoc,
                iframeDoc.body,
                section().cfiBase,
                section().index
            )
        );
    }

    createEffect(() => {
        if (ready()) {
            iframe.contentDocument.body.style.fontSize = `${fontSize()}px`;
        }
    });

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
                if (event.ctrlKey) setFontSize(fontSize() - 1);
                break;
            case "=":
                if (event.ctrlKey) setFontSize(fontSize() + 1);
                break;
        }
    }

    onMount(() => {
        window.addEventListener("keydown", onKeyDown);
        props.prevListener?.listen(pageUpOrPrev);
        props.nextListener?.listen(pageDownOrNext);
        props.displayListener?.listen(display);

        onCleanup(() => {
            window.removeEventListener("keydown", onKeyDown);
            props.prevListener?.remove(pageUpOrPrev);
            props.nextListener?.remove(pageDownOrNext);
            props.displayListener?.remove(display);
        });
    });

    return (
        <div
            class="w-full h-full overflow-scroll relative"
            style={{ "scroll-behavior": "smooth" }}
            ref={scroller}
            onWheel={(event) => {
                if (event.ctrlKey) event.preventDefault();
                setFontSize(fontSize() + event.deltaY / Math.abs(event.deltaY));
            }}
        >
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
                    }}
                ></iframe>
            </Show>
        </div>
    );
}
