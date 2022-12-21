import { listen } from "@tauri-apps/api/event";
import { onCleanup } from "solid-js";
import { filterByExtension } from "./util/path";

export function FileDropHandler(props: {
    onHover?: (value: boolean) => void;
    onFileDrop?: (files: string[]) => void;
    allowedExtensions?: string[];
}) {
    const hoverHandler = listen<string[]>("tauri://file-drop-hover", () => {
        props.onHover?.(true);
    });
    const cancelledHandler = listen("tauri://file-drop-cancelled", () => {
        props.onHover?.(false);
    });
    const fileDropHandler = listen<string[]>(
        "tauri://file-drop",
        async (event) => {
            props.onHover?.(false);

            let allowedFiles = props.allowedExtensions
                ? await filterByExtension(
                      event.payload,
                      props.allowedExtensions
                  )
                : event.payload;

            if (allowedFiles.length > 0) {
                props.onFileDrop?.(allowedFiles);
            }
        }
    );

    onCleanup(async () => {
        // Unsubscribe from events
        for (const unlisten of await Promise.all([
            hoverHandler,
            fileDropHandler,
            cancelledHandler,
        ])) {
            unlisten();
        }
    });

    return <></>;
}
