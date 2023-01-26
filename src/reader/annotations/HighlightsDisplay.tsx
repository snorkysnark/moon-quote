import { For } from "solid-js";
import { AnnotationHighlight } from "./annotations";

export default function HighlightsDisplay(props: {
    highlights: AnnotationHighlight[];
}) {
    return (
        <svg class="absolute overflow-visible pointer-events-none mix-blend-multiply">
            <For each={props.highlights}>
                {(highlight) => (
                    <g style={{ fill: highlight.annotation.data.color }}>
                        <For each={highlight.clientRects}>
                            {(clientRect) => (
                                <rect
                                    x={clientRect.x}
                                    y={clientRect.y}
                                    width={clientRect.width}
                                    height={clientRect.height}
                                ></rect>
                            )}
                        </For>
                    </g>
                )}
            </For>
        </svg>
    );
}
