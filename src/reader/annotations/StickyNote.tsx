import { JSX } from "solid-js";
import { AnnotationNote } from "./annotationRanges";
import NoteIcon from "src/decor/stickyNote.svg?component-solid";

export default function StickyNote(props: {
    note: AnnotationNote;
    onClick: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent>;
    selected: boolean;
}) {
    return (
        <div
            class="absolute cursor-pointer"
            classList={{
                "border-2": props.selected,
                "border-blue-500": props.selected,
            }}
            style={{
                left: `${props.note.rect.x - 11}px`,
                top: `${props.note.rect.y}px`,
            }}
            onClick={props.onClick}
        >
            <NoteIcon
                classList={{ "opacity-50": !props.selected }}
                fill={props.note.annotation.entry.color}
            />
        </div>
    );
}
