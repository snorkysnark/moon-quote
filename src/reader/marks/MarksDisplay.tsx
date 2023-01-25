import { For } from "solid-js";
import { Highlight, Marker } from "./marks";

export default function MarksDisplay(props: {
    highlights: Highlight[];
    markers: Marker[];
}) {
    return (
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
                    <g class="fill-red-500">
                        <rect x={marker.rect.x - 4} y={marker.rect.y - 6} width="8" height="8"></rect>
                        <rect
                            x={marker.rect.x - 1}
                            y={marker.rect.y}
                            width="2"
                            height={marker.rect.height}
                        ></rect>
                    </g>
                )}
            </For>
        </svg>
    );
}
