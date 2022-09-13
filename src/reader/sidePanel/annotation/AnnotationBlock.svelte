<script lang="ts">
    import AddContextMenu from "src/AddContextMenu.svelte";
    import type { AnnotationDatabaseEntry } from "src/backend";
    import * as clipboard from "@tauri-apps/api/clipboard";
    import { makeAnnotationURL } from "src/deeplink";

    export let annotation: AnnotationDatabaseEntry;

    let container: HTMLElement;
</script>

<button on:click bind:this={container}>
    <div
        id="colorMark"
        style={`background-color: var(--highlight${annotation.color});`}
    />
    <p>{annotation.textContent}</p>
</button>

{#if container}
    <AddContextMenu
        target={container}
        items={[
            {
                label: "Copy Link",
                action: () => {
                    clipboard.writeText(makeAnnotationURL(annotation));
                },
            },
        ]}
    />
{/if}

<style>
    button {
        display: flex;
        align-items: stretch;
    }

    p {
        text-align: left;
    }

    #colorMark {
        flex: 0 0 auto;
        width: 10px;
        margin-right: 5px;
    }
</style>
