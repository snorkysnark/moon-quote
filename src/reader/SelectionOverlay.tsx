import { createElementBounds } from "@solid-primitives/bounds";
import { createMemo, createSignal, Show } from "solid-js";
import { BiRegularLinkAlt } from "solid-icons/bi";
import { BiRegularHighlight } from "solid-icons/bi";
import * as clipboard from "@tauri-apps/api/clipboard";
import { makeTargetURL } from "src/backend/deeplink";
import { EpubCFI } from "epubjs";
import { toast } from "src/toast";
import CaretOverlay from "./CaretOverlay";

export default function SelectionOverlay(props: {
    bookId: string;
    selectionRect: DOMRect;
    selectionRange: Range;
    baseCfi: string;
    onHighlight: () => void;
}) {
    const [container, setContainer] = createSignal<HTMLElement>();
    const containerBounds = createElementBounds(container);

    const position = createMemo(() => {
        const x =
            props.selectionRect.x +
            props.selectionRect.width / 2 -
            (containerBounds.width || 0) / 2;
        const y = props.selectionRect.y - (containerBounds.height || 0);

        return { x, y };
    });

    return (
        <>
            <div
                class="absolute bg-white flex p-1 shadow-neutral-400 shadow-md z-10"
                style={{
                    left: `${position().x}px`,
                    top: `${position().y}px`,
                }}
                ref={setContainer}
            >
                <button
                    class="p-1 hover:bg-blue-100"
                    onClick={() => {
                        clipboard.writeText(
                            makeTargetURL({
                                bookId: props.bookId,
                                range: new EpubCFI(
                                    props.selectionRange,
                                    props.baseCfi
                                ).toString(),
                            })
                        );
                        toast("Copied URL to clipboard");
                    }}
                >
                    <BiRegularLinkAlt title="Link" class="scale-125" />
                </button>
                <button
                    class="p-1 hover:bg-blue-100"
                    onClick={props.onHighlight}
                >
                    <BiRegularHighlight class="scale-125" />
                </button>
            </div>

            <Show when={props.selectionRange.collapsed}>
                <CaretOverlay caretRect={props.selectionRect} />
            </Show>
        </>
    );
}
