import { For } from "solid-js";
import { AnnotationHighlight, AnnotationFlag } from "./marks";
import { BsFlagFill } from 'solid-icons/bs'

export default function AnnotationsDisplay(props: {
    highlights: AnnotationHighlight[];
    flags: AnnotationFlag[];
}) {
    return (
        <>
            <svg class="absolute overflow-visible pointer-events-none mix-blend-multiply">
                <For each={props.highlights}>
                    {(mark) => (
                        <g class="fill-yellow-200">
                            <For each={mark.clientRects}>
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
                    {(marker) => (
                        <rect
                            class="fill-red-500"
                            x={marker.rect.x - 1}
                            y={marker.rect.y}
                            width="3"
                            height={marker.rect.height}
                        ></rect>
                    )}
                </For>
            </svg>

            <For each={props.flags}>
                {(marker) => (
                    <div
                        class="absolute"
                        style={{
                            left: `${marker.rect.x - 1}px`,
                            top: `${marker.rect.y}px`,
                        }}
                    >
                        <BsFlagFill color="red" class="mix-blend-multiply" />
                    </div>
                )}
            </For>
        </>
    );
}
