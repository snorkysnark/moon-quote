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
import EpubView from "./EpubView";

export interface Controller {
    display: (target: number) => void;
    prev: () => void;
    next: () => void;
}

export default function EpubRendition(props: {
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

    // @ts-ignore: wrong type signature for prev()
    const prevSection = () => section()?.prev() as Section;
    // @ts-ignore: wrong type signature for next()
    const nextSection = () => section()?.next() as Section;

    // Load section content into a Blob
    const request = createMemo(() => (path: string) => props.epub.load(path));

    const controller: Controller = {
        display: (target: number) => {
            setSection(props.epub.spine.get(target));
        },
        prev: () => {
            if (prevSection()) {
                setSection(prevSection());
            }
        },
        next: () => {
            if (nextSection()) setSection(nextSection());
        },
    };
    if (props.setController) props.setController(controller);

    return (
        <Show when={section()}>
            <EpubView request={request()} section={section()} />
        </Show>
    );
}
