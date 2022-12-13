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
import { useReaderContext } from "./Reader";

export default function EpubDisplay(props: { epub: Book }) {
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
            scroller.scrollLeft = 0;
            if (scrollTarget().side === "top") {
                scroller.scrollTop = 0;
            } else {
                scroller.scrollTop = textHeight();
            }
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
                    setTextHeight(lastContents.textHeight());
                    setReady(true);
                };
                lastContents.on(EVENTS.CONTENTS.RESIZE, onResize);

                onCleanup(() => {
                    lastContents.off(EVENTS.CONTENTS.RESIZE, onResize);
                    lastContents.destroy();
                });
            }
        })
    );

    let scroller: HTMLDivElement;
    let iframe: HTMLIFrameElement;
    function onLoadIframe() {
        const iframeDoc = iframe.contentDocument;
        iframeDoc.body.style.overflow = "hidden";

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

    function onKeyDown(event: KeyboardEvent) {
        event.preventDefault();
        switch (event.key) {
            case "ArrowLeft":
                toPrevSection();
                break;
            case "ArrowRight":
                toNextSection();
                break;
        }
    }

    const context = useReaderContext();
    onMount(() => {
        window.addEventListener("keydown", onKeyDown);
        const unbindNext = context.events.on("next", toNextSection);
        const unbindPrev = context.events.on("prev", toPrevSection);

        onCleanup(() => {
            window.removeEventListener("keydown", onKeyDown);
            unbindNext();
            unbindPrev();
        });
    });

    return (
        <div class="w-full h-full overflow-scroll relative" ref={scroller}>
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
