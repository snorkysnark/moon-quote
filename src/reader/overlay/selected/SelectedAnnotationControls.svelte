<script lang="ts">
    import type { Contents } from "epubjs";
    import type { AnnotationDatabaseEntry } from "src/backend";
    import { createEventDispatcher } from "svelte";
    import * as clipboard from "@tauri-apps/api/clipboard";
    import { makeAnnotationURL } from "src/deeplink";

    export let rect: DOMRect;
    export let contents: Contents;
    export let selectedAnnotation: AnnotationDatabaseEntry;

    const offset = 5;
    let clientHeight: number;
    let clientWidth: number;

    let myDimensions: { width: number; height: number };
    $: myDimensions = { width: clientWidth || 50, height: clientHeight || 50 };

    let position: { x: number; y: number };
    $: {
        let newPosition = {
            x: rect.x + rect.width - myDimensions.width + offset,
            y: rect.y + rect.height + offset,
        };
        if (
            newPosition.y + myDimensions.height >
            contents.document.body.clientHeight
        ) {
            newPosition.y = rect.y - myDimensions.height;
        }
        position = newPosition;
    }

    const dispatch =
        createEventDispatcher<{ deleteAnnotation: AnnotationDatabaseEntry }>();
</script>

<div
    id="controls"
    style="left: {position.x}px; top: {position.y}px;"
    bind:clientWidth
    bind:clientHeight
    on:mousedown|stopPropagation
>
    <button
        on:click={() => {
            dispatch("deleteAnnotation", selectedAnnotation);
        }}>X</button
    >
    <button
        on:click={() => {
            clipboard.writeText(makeAnnotationURL(selectedAnnotation));
        }}>URL</button
    >
</div>

<style>
    #controls {
        z-index: 1;
        position: absolute;
        background-color: blue;

        display: flex;
        flex-direction: row-reverse;
    }

    button {
        min-width: 30px;
        height: 25px;
        box-sizing: content-box;
        background: none;
        border: none;
        color: white;
        font-weight: bolder;

        margin: 5px;
        padding: 0;

        cursor: pointer;
    }

    button:hover {
        background-color: black;
    }
</style>
