import { For, Show, untrack } from "solid-js";
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
        <div
            class="flex flex-col gap-1 select-none"
            onKeyDown={(e) => e.stopPropagation()}
        >
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
                                <div
                                    class="border-2 rounded border-blue-500"
                                    classList={{
                                        "border-dashed bg-blue-100":
                                            !selected(annotation),
                                        "bg-yellow-100": selected(annotation),
                                    }}
                                    contentEditable={selected(annotation)}
                                    onInput={(event) => {
                                        annotation.setComment(
                                            (event.target as HTMLElement)
                                                .innerText
                                        );
                                    }}
                                >
                                    {untrack(annotation.comment)}
                                </div>
                            </Show>
                        </div>
                    </button>
                )}
            </For>
        </div>
    );
}
