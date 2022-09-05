<script lang="ts">
    import * as dialog from "@tauri-apps/api/dialog";
    import { createEventDispatcher } from "svelte";

    export let disabled: boolean = false;
    export let filters: dialog.DialogFilter[] = null;

    const dispatch = createEventDispatcher<{ selected: string[] }>();

    async function onClick() {
        const selected = await dialog.open({
            multiple: true,
            filters,
        });
        if (selected === null) return;

        let pathList = Array.isArray(selected) ? selected : [selected];
        dispatch("selected", pathList);
    }
</script>

<button {disabled} on:click={onClick}>+</button>

<style>
    button {
        width: 100px;
        font-size: 25px;
    }
</style>
