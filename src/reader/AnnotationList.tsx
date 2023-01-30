import { For, Show } from "solid-js";
import { AnnotationsResource } from "./annotations";
import NoteIcon from "src/decor/stickyNote.svg?component-solid";
import { AnnotationEntry } from "src/backend/library";
import { EpubCFI } from "epubjs";

export default function AnnotationList(props: {
    annotations: AnnotationsResource;
    selectedCfi: EpubCFI;
    onClick: (annotation: AnnotationEntry) => void;
}) {
    return (
        <div class="flex flex-col gap-1 py-1 select-none">
            <For each={props.annotations.value()}>
                {(annotation) => (
                    <button
                        class="bg-white p-1 text-left"
                        classList={{
                            "border-4": annotation.cfi === props.selectedCfi,
                            "border-blue-500": annotation.cfi === props.selectedCfi,
                        }}
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
