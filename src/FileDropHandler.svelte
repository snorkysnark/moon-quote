<script lang="ts">
    import { onDestroy } from "svelte";
    import { listen } from "@tauri-apps/api/event";
    import { createEventDispatcher } from "svelte";

    export let hoveringFiles: string[] = null;

    const hoverHandler = listen<string[]>(
        "tauri://file-drop-hover",
        (event) => {
            hoveringFiles = event.payload;
        }
    );
    const cancelledHandler = listen<string[]>(
        "tauri://file-drop-cancelled",
        () => {
            hoveringFiles = null;
        }
    );

    const dispatch = createEventDispatcher<{ fileDrop: string[] }>();
    const fileDropHandler = listen<string[]>("tauri://file-drop", (event) => {
        hoveringFiles = null;
        dispatch("fileDrop", event.payload);
    });

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
