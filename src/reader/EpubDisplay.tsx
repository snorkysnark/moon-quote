import { Book } from "epubjs";
import Section from "epubjs/types/section";
import {
    createEffect,
    createMemo,
    createResource,
    createSignal,
    on,
    onCleanup,
    Show,
} from "solid-js";
import { createBlobUrl, revokeBlobUrl } from "epubjs/src/utils/core";

export default function EpubDisplay(props: { epub: Book }) {
    const [section, setSection] = createSignal<Section>(null);
    const display = (target: number) => {
        setSection(props.epub.spine.get(target));
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

    const [html] = createResource(
        () => (section() ? { section: section(), epub: props.epub } : null),
        ({ section, epub }) => {
            return section.render((path: string) => epub.load(path));
        }
    );
    const blobUrl = createMemo(() => {
        if (html()) {
            const url = createBlobUrl(html(), "application/xhtml+xml");
            onCleanup(() => revokeBlobUrl(url));
            return url;
        }
    });

    return (
        <Show when={blobUrl()}>
            <iframe class="w-full h-full" src={blobUrl()}></iframe>
        </Show>
    );
}
