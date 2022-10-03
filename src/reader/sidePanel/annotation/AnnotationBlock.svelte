<script lang="ts">
    import type { AnnotationDatabaseEntry } from "src/backend";
    import * as clipboard from "@tauri-apps/api/clipboard";
    import { makeAnnotationURL } from "src/deeplink";
    import { contextMenu } from "src/contextmenu";

    export let annotation: AnnotationDatabaseEntry;
</script>

<button
    on:click
    use:contextMenu={[
        {
            label: "Copy Link",
            action: () => {
                clipboard.writeText(makeAnnotationURL(annotation));
            },
        },
    ]}
>
    <div
        id="colorMark"
        style={`background-color: var(--highlight${annotation.color});`}
    />
    <p>{annotation.textContent}</p>
</button>

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
