import { For, Show } from "solid-js";
import { AnnotationsResource } from "./annotations";
import { AnnotationEntry } from "src/backend/library";

export default function AnnotationList(props: {
    annotations: AnnotationsResource;
    selectedId: number;
    onClick: (annotation: AnnotationEntry) => void;
}) {
    const selected = (annotation: AnnotationEntry) =>
        annotation.annotationId === props.selectedId;

    return (
        <div class="flex flex-col gap-1 select-none">
            <For each={props.annotations.value()}>
                {(annotation) => (
                    <button
                        class="bg-white flex items-stretch min-h-[1lh]"
                        classList={{
                            "bg-white": !selected(annotation),
                            "bg-blue-300": selected(annotation),
                        }}
                        onClick={[props.onClick, annotation]}
                    >
                        <div
                            class="w-2 shrink-0"
                            style={{ background: annotation.color }}
                        />
                        <div class="grow flex flex-col text-left p-1">
                            <p>{annotation.textContent}</p>
                            <Show
                                when={
                                    annotation.comment() || selected(annotation)
                                }
                            >
                                <textarea
                                    rows="1"
                                    class="bg-yellow-100 resize-none border-orange-500 border-2 rounded border-dashed"
                                    classList={{
                                        "pointer-events-none":
                                            !selected(annotation),
                                    }}
                                    disabled={!selected(annotation)}
                                    value={annotation.comment()}
                                    onInput={(event) => {
                                        annotation.setComment(
                                            (
                                                event.target as HTMLTextAreaElement
                                            ).value
                                        );
                                    }}
                                />
                            </Show>
                        </div>
                    </button>
                )}
            </For>
        </div>
    );
}
