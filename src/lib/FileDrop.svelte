<script lang="ts">
    import { onDestroy } from "svelte";
    import { listen } from "@tauri-apps/api/event";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher<{ fileDrop: string[] }>();

    const fileDropHandler = listen<string[]>("tauri://file-drop", (event) => {
        dispatch("fileDrop", event.payload);
    });

    onDestroy(async () => {
        // Unsubscribe from events
        (await fileDropHandler)();
    });
</script>
