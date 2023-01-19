import { createElementBounds } from "@solid-primitives/bounds";
import { createMemo, createSignal } from "solid-js";
import { ImLink } from "solid-icons/im";

export default function SelectionOverlay(props: { selectionRect: DOMRect }) {
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
            class="absolute bg-white flex shadow-neutral-400 shadow-md p-1"
            style={{
                left: `${position().x}px`,
                top: `${position().y}px`,
            }}
            ref={setContainer}
        >
            <button class="p-1 hover:bg-blue-100">
                <ImLink title="Link" />
            </button>
        </div>
    );
}
