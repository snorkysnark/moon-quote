import { Book } from "epubjs";
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
import "iframe-resizer/js/iframeResizer";
import iframeResizerInner from "iframe-resizer/js/iframeResizer.contentWindow?url";

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

    let firstLoad = true;
    const onLoadIframe = () => {
        iframe.contentWindow.addEventListener("keydown", onKeyDown);

        const script = document.createElement("script");
        script.setAttribute("src", iframeResizerInner);
        iframe.contentDocument.body.appendChild(script);

        // Have to set up iframeResizer after we've injected the script
        if (firstLoad) {
            iFrameResize(
                {
                    checkOrigin: false,
                    heightCalculationMethod: "lowestElement",
                },
                iframe
            );
            firstLoad = false;
        }
    };

    return (
        <Show when={blobUrl()}>
            <iframe
                class="w-full"
                src={blobUrl()}
                ref={iframe}
                onLoad={onLoadIframe}
            ></iframe>
        </Show>
    );
}
