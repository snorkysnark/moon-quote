import { For } from "solid-js";
import { Highlight, Marker } from "./marks";
import { BsFlagFill } from 'solid-icons/bs'

export default function MarksDisplay(props: {
    highlights: Highlight[];
    markers: Marker[];
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

                <For each={props.markers}>
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

            <For each={props.markers}>
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
