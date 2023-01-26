import { AnnotationFlag } from "./annotations";

export default function StickyNote(props: { flag: AnnotationFlag }) {
    return (
        <div
            class="absolute opacity-50 hover:opacity-100"
            style={{
                left: `${props.flag.rect.x - 10}px`,
                top: `${props.flag.rect.y}px`,
            }}
        >
            <svg width="22" height="22" class="stroke-2">
                <g
                    class="stroke-black"
                    style={{ fill: props.flag.annotation.data.color }}
                >
                    <polygon points="1,1 21,1 21,21 11,21 1,11" />
                    <polygon points="1,11 11,11 11,21" />
                </g>
            </svg>
        </div>
    );
}
