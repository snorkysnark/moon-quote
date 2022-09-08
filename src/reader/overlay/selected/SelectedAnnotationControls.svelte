<script lang="ts">
    import type { Contents } from "epubjs";
    import type { AnnotationDatabaseEntry } from "src/backend";
    import { createEventDispatcher } from "svelte";

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
>
    <button
        on:click={() => {
            dispatch("deleteAnnotation", selectedAnnotation);
        }}
        on:mousedown|stopPropagation>X</button
    >
</div>

<style>
    #controls {
        z-index: 1;
        position: absolute;
        background-color: blue;
    }

    button {
        width: 30px;
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
