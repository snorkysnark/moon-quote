<script lang="ts">
    import { onDestroy } from "svelte";
    import { listen } from "@tauri-apps/api/event";
    import { createEventDispatcher } from "svelte";
    import { filterByExtension } from "./utils";

    export let hovering: boolean = false;
    export let allowedExtensions: string[] = null;

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

            let allowedFiles = allowedExtensions
                ? await filterByExtension(event.payload, allowedExtensions)
                : event.payload;
            console.log(allowedFiles);

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
