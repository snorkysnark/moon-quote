import { Book, Contents } from "epubjs";
import Section from "epubjs/types/section";
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
import { createBlobUrl, revokeBlobUrl } from "epubjs/src/utils/core";
import { EVENTS } from "epubjs/src/utils/constants";

export interface Controller {
    display: (target: number) => void;
    prev: () => void;
    next: () => void;
}

export default function EpubDisplay(props: {
    epub: Book;
    setController?: (controller: Controller) => void;
}) {
    const [section, setSection] = createSignal<Section>(null);
    // @ts-ignore: wrong type signature for prev()
    const prevSection = () => section()?.prev() as Section;
    // @ts-ignore: wrong type signature for next()
    const nextSection = () => section()?.next() as Section;

    const controller: Controller = {
        display: (target: number) => {
            setSection(props.epub.spine.get(target));
        },
        prev: () => {
            if (prevSection()) setSection(prevSection());
        },
        next: () => {
            if (nextSection()) setSection(nextSection());
        },
    };
    if (props.setController) props.setController(controller);

    // When the book changes, reset to its first section
    createEffect(
        on(
            () => props.epub,
            () => {
                controller.display(0);
                onCleanup(() => setSection(null));
            }
        )
    );

    const [contents, setContents] = createSignal<Contents>(null);
    // When the section changes, reset the associated values
    createEffect(
        on(section, () => {
            onCleanup(() => {
                setContents(null);
            });
        })
    );

    const request = createMemo(() => (path: string) => props.epub.load(path));
    const [html] = createResource(
        () => (section() ? { section: section(), request: request() } : null),
        ({ section, request }) => {
            return section.render(request);
        }
    );
    const blobUrl = createMemo(() => {
        if (html()) {
            const url = createBlobUrl(html(), "application/xhtml+xml");
            onCleanup(() => revokeBlobUrl(url));
            return url;
        }
    });

    const onKeyDown = (event: KeyboardEvent) => {
        event.preventDefault();
        switch (event.key) {
            case "ArrowLeft":
                controller.prev();
                break;
            case "ArrowRight":
                controller.next();
                break;
        }
    };

    let iframe: HTMLIFrameElement;
    onMount(() => {
        window.addEventListener("keydown", onKeyDown);

        onCleanup(() => {
            window.removeEventListener("keydown", onKeyDown);
        });
    });

    const onLoadIframe = () => {
        iframe.contentWindow.addEventListener("keydown", onKeyDown);

        const iframeDoc = iframe.contentDocument;
        iframeDoc.body.style.overflow = "hidden";

        setContents(
            new Contents(
                iframeDoc,
                iframeDoc.body,
                section().cfiBase,
                section().index
            )
        );
    };

    const [textHeight, setTextHeight] = createSignal<number>(null);
    createEffect(
        on(contents, () => {
            if (contents()) {
                const lastContents = contents();
                const onResize = () => setTextHeight(lastContents.textHeight());
                lastContents.on(EVENTS.CONTENTS.RESIZE, onResize);

                onCleanup(() => {
                    lastContents.off(EVENTS.CONTENTS.RESIZE, onResize);
                    lastContents.destroy();
                    setTextHeight(null);
                });
            }
        })
    );

    return (
        <div class="w-full h-full overflow-hidden">
            <Show when={blobUrl()}>
                <iframe
                    class="w-full overflow-hidden"
                    src={blobUrl()}
                    ref={iframe}
                    onLoad={onLoadIframe}
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
