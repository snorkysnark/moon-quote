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

    const [section, setSection] = createSignal<Section>(null);
    // When the section changes, reset the associated values
    createEffect(
        on(section, () => {
            onCleanup(() => {
                setContents(null);
            });
        })
    );

    // @ts-ignore: wrong type signature for prev()
    const prevSection = () => section()?.prev() as Section;
    // @ts-ignore: wrong type signature for next()
    const nextSection = () => section()?.next() as Section;

    const [contents, setContents] = createSignal<Contents>(null);
    createEffect(
        on(contents, () => {
            if (contents()) {
                const lastContents = contents();
                const onResize = () => {
                    setTextHeight(lastContents.textHeight())
                };
                lastContents.on(EVENTS.CONTENTS.RESIZE, onResize);

                onCleanup(() => {
                    lastContents.off(EVENTS.CONTENTS.RESIZE, onResize);
                    lastContents.destroy();
                    setTextHeight(null);
                });
            }
        })
    );
    const [textHeight, setTextHeight] = createSignal<number>(null);

    // Load section content into a Blob
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

    const controller: Controller = {
        display: (target: number) => {
            setSection(props.epub.spine.get(target));
        },
        prev: () => {
            if (prevSection()) {
                setSection(prevSection())
            };
        },
        next: () => {
            if (nextSection()) setSection(nextSection());
        },
    };
    if (props.setController) props.setController(controller);

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
        // No need to removeEventListener, since document gets unloaded anyway
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

    return (
        <div class="w-full h-full overflow-scroll relative">
            <div class="absolute w-10 h-10 top-10 left-10 bg-red-500 pointer-events-none"></div>
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
