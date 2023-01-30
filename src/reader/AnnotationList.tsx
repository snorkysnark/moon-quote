import { For, Show } from "solid-js";
import { AnnotationsResource } from "./annotations";
import NoteIcon from "src/decor/stickyNote.svg?component-solid";
import { AnnotationEntry } from "src/backend/library";

export default function AnnotationList(props: {
    annotations: AnnotationsResource;
    onClick: (annotation: AnnotationEntry) => void;
}) {
    return (
        <div class="flex flex-col gap-1 py-1 select-none">
            <For each={props.annotations.value()}>
                {(annotation) => (
                    <button
                        class="bg-white p-1 text-left"
                        onClick={[props.onClick, annotation]}
                    >
                        <Show
                            fallback={<NoteIcon fill={annotation.color} />}
                            when={annotation.cfi.range}
                        >
                            <span
                                style={{
                                    background: annotation.color,
                                }}
                            >
                                {annotation.textContent}
                            </span>
                        </Show>
                    </button>
                )}
            </For>
        </div>
    );
}
