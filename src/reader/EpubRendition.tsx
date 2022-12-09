import { Book } from "epubjs";
import Section from "epubjs/types/section";
import {
    batch,
    createEffect,
    createMemo,
    createSignal,
    on,
    onCleanup,
    onMount,
    Show,
} from "solid-js";
import EpubView from "./EpubView";

export interface Controller {
    display: (section: Section | number, scrollTarget?: string) => void;
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
                myController.display(0);
                onCleanup(() => setSection(null));
            }
        )
    );

    const [section, setSection] = createSignal<Section>(null);
    const [scrollTarget, setScrollTarget] = createSignal<string>(null);

    // @ts-ignore: wrong type signature for prev()
    const prevSection = () => section()?.prev() as Section;
    // @ts-ignore: wrong type signature for next()
    const nextSection = () => section()?.next() as Section;

    // Load section content into a Blob
    const request = createMemo(() => (path: string) => props.epub.load(path));

    const myController: Controller = {
        display: (section: Section | number, scrollTarget: string = "top") => {
            batch(() => {
                if (typeof section === "number") {
                    setSection(props.epub.spine.get(section));
                } else {
                    setSection(section);
                }
                setScrollTarget(scrollTarget);
            });
        },
        prev: () => {
            if (prevSection()) {
                myController.display(prevSection(), "bottom");
            }
        },
        next: () => {
            if (nextSection()) {
                myController.display(nextSection());
            }
        },
    };
    if (props.setController) props.setController(myController);

    const onKeyDown = (event: KeyboardEvent) => {
        event.preventDefault();
        switch (event.key) {
            case "ArrowLeft":
                myController.prev();
                break;
            case "ArrowRight":
                myController.next();
                break;
        }
    };
    onMount(() => {
        window.addEventListener("keydown", onKeyDown);
        onCleanup(() => {
            window.removeEventListener("keydown", onKeyDown);
        });
    });

    return (
        <Show when={section()}>
            <EpubView
                request={request()}
                section={section()}
                scrollTarget={scrollTarget()}
                onKeyDown={onKeyDown}
            />
        </Show>
    );
}
