<script lang="ts">
    import { onDestroy } from "svelte";
    import { listen } from "@tauri-apps/api/event";
    import { createEventDispatcher } from "svelte";

    export let hovering: boolean = false;

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
    const fileDropHandler = listen<string[]>("tauri://file-drop", (event) => {
        hovering = false;
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
