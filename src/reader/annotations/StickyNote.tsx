import { JSX, Show } from "solid-js";
import { AnnotationNote } from "./annotations";

const ICON_OFFSET = 3;
const ICON_SIZE = 10;

export default function StickyNote(props: {
    flag: AnnotationNote;
    onClick: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent>;
    selected: boolean;
}) {
    return (
        <div
            class="absolute"
            style={{
                left: `${props.flag.rect.x - 10}px`,
                top: `${props.flag.rect.y}px`,
            }}
            onClick={props.onClick}
        >
            <svg width="26" height="26" class="stroke-2">
                <g
                    class="hover:opacity-100 cursor-pointer stroke-black"
                    classList={{ "opacity-50": !props.selected }}
                    style={{ fill: props.flag.annotation.data.color }}
                    stroke-linejoin="bevel"
                >
                    <polygon
                        points={`${ICON_OFFSET},${ICON_OFFSET} ${
                            ICON_OFFSET + ICON_SIZE * 2
                        },${ICON_OFFSET} ${ICON_OFFSET + ICON_SIZE * 2},${
                            ICON_OFFSET + ICON_SIZE * 2
                        } ${ICON_OFFSET + ICON_SIZE},${
                            ICON_OFFSET + ICON_SIZE * 2
                        } ${ICON_OFFSET},${ICON_OFFSET + ICON_SIZE}`}
                    />
                    <polygon
                        points={`${ICON_OFFSET},${ICON_OFFSET + ICON_SIZE} ${
                            ICON_OFFSET + ICON_SIZE
                        },${ICON_OFFSET + ICON_SIZE} ${
                            ICON_OFFSET + ICON_SIZE
                        },${ICON_OFFSET + ICON_SIZE * 2}`}
                    />
                </g>
                <Show when={props.selected}>
                    <rect
                        class="fill-none stroke-blue-500 stroke-2"
                        x="1"
                        y="1"
                        width="24"
                        height="24"
                    />
                </Show>
            </svg>
        </div>
    );
}
