<script lang="ts">
    import { onDestroy } from "svelte";
    import { listen } from "@tauri-apps/api/event";
    import { createEventDispatcher } from "svelte";
    import { asyncFilter } from "./utils";
    import * as path from "@tauri-apps/api/path";

    export let hovering: boolean = false;
    export let extensionFilter: string[] = null;

    const hoverHandler = listen<string[]>("tauri://file-drop-hover", () => {
        hovering = true;
    });
    const cancelledHandler = listen<string[]>(
        "tauri://file-drop-cancelled",
        () => {
            hovering = false;
        }
    );

    const dispatch = createEventDispatcher<{ fileDrop: string[] }>();
    const fileDropHandler = listen<string[]>(
        "tauri://file-drop",
        async (event) => {
            hovering = false;

            let allowedFiles = extensionFilter
                ? await asyncFilter(event.payload, async (filePath) =>
                      extensionFilter!.includes(await path.extname(filePath))
                  )
                : event.payload;

            if (allowedFiles.length > 0) {
                dispatch("fileDrop", allowedFiles);
            }
        }
    );

    onDestroy(async () => {
        // Unsubscribe from events
        for (const unlisten of await Promise.all([
            hoverHandler,
            fileDropHandler,
            cancelledHandler,
        ])) {
            unlisten();
        }
    });
</script>
