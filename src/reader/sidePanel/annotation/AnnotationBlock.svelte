<script lang="ts">
    import AddContextMenu from "src/AddContextMenu.svelte";
    import type {
        AnnotationDatabaseEntry,
        BookDatabaseEntry,
    } from "src/backend";
    import * as clipboard from "@tauri-apps/api/clipboard";

    export let annotation: AnnotationDatabaseEntry;
    export let bookEntry: BookDatabaseEntry;

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
                    clipboard.writeText(
                        `moonquote:///book/${bookEntry.bookId}/annotation/${annotation.annotationId}`
                    );
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
