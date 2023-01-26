import { For, Show } from "solid-js";
import { AnnotationData, AnnotationHighlight } from "./annotations";

export default function HighlightsOverlay(props: {
    highlights: AnnotationHighlight[];
    onClick: (annotation: AnnotationData) => void;
    selectedAnnotation: AnnotationData;
}) {
    return (
        <svg class="absolute overflow-visible mix-blend-multiply">
            <For each={props.highlights}>
                {(highlight) => (
                    <>
                        <g
                            class="cursor-pointer"
                            style={{ fill: highlight.annotation.data.color }}
                            onClick={[props.onClick, highlight.annotation.data]}
                        >
                            <For each={highlight.clientRects}>
                                {(clientRect) => (
                                    <rect
                                        x={clientRect.x}
                                        y={clientRect.y}
                                        width={clientRect.width}
                                        height={clientRect.height}
                                    />
                                )}
                            </For>
                        </g>
                        <Show when={highlight.annotation.data === props.selectedAnnotation}>
                            <rect
                                class="fill-none stroke-blue-500 stroke-2"
                                x={highlight.bounds.x}
                                y={highlight.bounds.y}
                                width={highlight.bounds.width}
                                height={highlight.bounds.height}
                            />
                        </Show>
                    </>
                )}
            </For>
        </svg>
    );
}
