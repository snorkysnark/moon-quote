import { createElementBounds } from "@solid-primitives/bounds";
import { createMemo, createSignal } from "solid-js";
import { ImLink, ImCopy } from "solid-icons/im";
import * as clipboard from "@tauri-apps/api/clipboard";
import Toastify from "toastify-js";
import { makeAnnotationURL } from "src/deeplink";
import { EpubCFI } from "epubjs";

export default function SelectionOverlay(props: {
    bookId: string;
    selectionRect: DOMRect;
    selectionRange: Range;
    baseCfi: string;
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
        <div
            class="absolute bg-white flex shadow-neutral-400 shadow-md"
            style={{
                left: `${position().x}px`,
                top: `${position().y}px`,
            }}
            ref={setContainer}
        >
            <button
                class="p-1 m-1 hover:bg-blue-100"
                onClick={() => {
                    clipboard.writeText(
                        makeAnnotationURL(
                            props.bookId,
                            new EpubCFI(
                                props.selectionRange,
                                props.baseCfi
                            ).toString()
                        )
                    );
                    Toastify({
                        text: "Copied URL to clipboard",
                        gravity: "bottom",
                    }).showToast();
                }}
            >
                <ImLink title="Link" />
            </button>
            <button
                class="p-1 m-1 hover:bg-blue-100"
                onClick={() => {
                    clipboard.writeText(props.selectionRange.toString());
                    Toastify({
                        text: "Copied text to clipboard",
                        gravity: "bottom",
                    }).showToast();
                }}
            >
                <ImCopy title="Copy" />
            </button>
        </div>
    );
}
