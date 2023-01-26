import { For } from "solid-js";
import { AnnotationHighlight, AnnotationFlag } from "./annotations";
import { BsFlagFill } from 'solid-icons/bs'

export default function AnnotationsDisplay(props: {
    highlights: AnnotationHighlight[];
    flags: AnnotationFlag[];
}) {
    return (
        <>
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

                <For each={props.flags}>
                    {(flag) => (
                        <rect
                            style={{ fill: flag.annotation.data.color }}
                            x={flag.rect.x - 1}
                            y={flag.rect.y}
                            width="3"
                            height={flag.rect.height}
                        ></rect>
                    )}
                </For>
            </svg>

            <For each={props.flags}>
                {(flag) => (
                    <div
                        class="absolute"
                        style={{
                            left: `${flag.rect.x - 1}px`,
                            top: `${flag.rect.y}px`,
                        }}
                    >
                        <BsFlagFill color={flag.annotation.data.color} class="mix-blend-multiply" />
                    </div>
                )}
            </For>
        </>
    );
}
