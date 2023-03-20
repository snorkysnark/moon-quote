import { EpubCFI } from "epubjs";
import { For, Show } from "solid-js";
import { AnnotationEntry } from "src/backend/library";
import { AnnotationHighlight } from "./annotationRanges";
import * as clipboard from "@tauri-apps/api/clipboard";
import { toast } from "src/toast";

// use:__ directives
import { contextMenu } from "src/contextMenu";
import { makeTargetURL } from "src/backend/deeplink";
false && contextMenu;

export default function HighlightsOverlay(props: {
    highlights: AnnotationHighlight[];
    onClick: (annotation: AnnotationEntry) => void;
    onDelete: (annotation: AnnotationEntry) => void;
    selectedAnnotationId: number;
}) {
    return (
        <svg class="absolute overflow-visible mix-blend-multiply">
            <For each={props.highlights}>
                {(highlight) => (
                    <g
                        class="cursor-pointer"
                        style={{ fill: highlight.annotation.entry.color }}
                        onClick={[props.onClick, highlight.annotation.entry]}
                        use:contextMenu={[
                            {
                                label: "Delete",
                                action: () =>
                                    props.onDelete(highlight.annotation.entry),
                            },
                            {
                                label: "URL",
                                action: () => {
                                    clipboard.writeText(
                                        makeTargetURL({
                                            annotation:
                                                highlight.annotation.entry
                                                    .annotationId,
                                        })
                                    );
                                    toast("Copied URL to clipboard");
                                },
                            },
                        ]}
                    >
                        <For each={highlight.clientRects}>
                            {(clientRect) => (
                                <rect
                                    x={clientRect.x}
                                    y={clientRect.y}
                                    width={clientRect.width}
                                    height={clientRect.height}
                                />
                            )}
                        </For>
                    </g>
                )}
            </For>
            <For each={props.highlights}>
                {(highlight) => (
                    <Show
                        when={
                            highlight.annotation.entry.annotationId ===
                            props.selectedAnnotationId
                        }
                    >
                        <rect
                            class="fill-none stroke-blue-500 stroke-2"
                            x={highlight.bounds.x}
                            y={highlight.bounds.y}
                            width={highlight.bounds.width}
                            height={highlight.bounds.height}
                        />
                    </Show>
                )}
            </For>
        </svg>
    );
}
