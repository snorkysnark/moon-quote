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

export default function EpubDisplay(props: { epub: Book }) {
    const [section, setSection] = createSignal<Section>(null);
    // @ts-ignore: wrong type signature for prev()
    const prevSection = () => section()?.prev() as Section;
    // @ts-ignore: wrong type signature for next()
    const nextSection = () => section()?.next() as Section;

    const display = (target: number) => {
        setSection(props.epub.spine.get(target));
    };
    const prev = () => {
        if (prevSection()) setSection(prevSection());
    };
    const next = () => {
        if (nextSection()) setSection(nextSection());
    };

    // When the book changes, reset to its first section
    createEffect(
        on(
            () => props.epub,
            () => {
                display(0);
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
                prev();
                break;
            case "ArrowRight":
                next();
                break;
        }
    };

    let iframe: HTMLIFrameElement;
    onMount(() => {
        window.addEventListener("keydown", onKeyDown);
        onCleanup(() => {
            window.removeEventListener("keydown", onKeyDown);
            if (iframe?.contentWindow) {
                iframe.contentWindow.removeEventListener("keydown", onKeyDown);
            }
        });
    });

    const onLoadIframe = () => {
        iframe.contentWindow.addEventListener("keydown", onKeyDown);
    };

    return (
        <Show when={blobUrl()}>
            <iframe
                class="w-full h-full"
                src={blobUrl()}
                ref={iframe}
                onLoad={onLoadIframe}
            ></iframe>
        </Show>
    );
}
