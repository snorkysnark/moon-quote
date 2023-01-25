import { For } from "solid-js";
import { Mark } from "./marks";

export default function MarksDisplay(props: { marks: Mark[] }) {
    return (
        <svg class="absolute overflow-visible pointer-events-none mix-blend-multiply">
            <For each={props.marks}>
                {(mark) => (
                    <For each={mark.clientRects}>
                        {(clientRect) => (
                            <rect
                                class="fill-yellow-200"
                                x={clientRect.x}
                                y={clientRect.y}
                                width={clientRect.width}
                                height={clientRect.height}
                            ></rect>
                        )}
                    </For>
                )}
            </For>
        </svg>
    );
}
