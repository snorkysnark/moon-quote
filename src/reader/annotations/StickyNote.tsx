import { JSX } from "solid-js";
import { AnnotationNote } from "./annotationRanges";
import NoteIcon from "src/decor/stickyNote.svg?component-solid";

// use:__ directives
import { contextMenu } from "src/contextMenu";
false && contextMenu;

export default function StickyNote(props: {
    note: AnnotationNote;
    onClick: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent>;
    onDelete: () => void;
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
            use:contextMenu={[
                { label: "Delete", action: props.onDelete }
            ]}
        >
            <NoteIcon
                class="hover:opacity-100"
                classList={{ "opacity-50": !props.selected }}
                fill={props.note.annotation.entry.color}
            />
        </div>
    );
}
