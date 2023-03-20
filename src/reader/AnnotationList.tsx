import { For, Show } from "solid-js";
import { AnnotationsResource } from "./annotations";
import NoteIcon from "src/decor/stickyNote.svg?component-solid";
import { AnnotationEntry } from "src/backend/library";

export default function AnnotationList(props: {
    annotations: AnnotationsResource;
    selectedId: number;
    onClick: (annotation: AnnotationEntry) => void;
}) {
    return (
        <div class="flex flex-col gap-1 py-1 select-none">
            <For each={props.annotations.value()}>
                {(annotation) => (
                    <button
                        class="bg-white p-1"
                        classList={{
                            "bg-white":
                                annotation.annotationId !== props.selectedId,
                            "bg-blue-300":
                                annotation.annotationId === props.selectedId,
                        }}
                        onClick={[props.onClick, annotation]}
                    >
                        <Show
                            fallback={<NoteIcon fill={annotation.color} />}
                            when={annotation.cfi.range}
                        >
                            <div class="flex items-stretch">
                                <div
                                    class="w-2 shrink-0 mr-1"
                                    style={{ background: annotation.color }}
                                />
                                <p class="text-left">
                                    {annotation.textContent}
                                </p>
                            </div>
                        </Show>
                    </button>
                )}
            </For>
        </div>
    );
}
