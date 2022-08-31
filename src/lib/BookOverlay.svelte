<script lang="ts">
    import { createEventDispatcher, onDestroy } from "svelte";

    export let bookDocument: Document;
    bookDocument.addEventListener("selectionchange", onSelectionChange);

    let selectionRange: Range = null;

    let position: [number, number];
    function computePosition(range: Range): [number, number] {
        const rect = range.getBoundingClientRect();
        const x = rect.x + rect.width / 2
        const y = (rect.y > 30) ? rect.y - 30 : rect.y + rect.height;
        return [x, y];
    }
    $: if(selectionRange) position = computePosition(selectionRange);


    const dispatch = createEventDispatcher<{ highlight: Range }>();

    function onSelectionChange() {
        const selection = bookDocument.getSelection();
        if (selection.type == "Range") {
            selectionRange = selection.getRangeAt(0);
        } else {
            selectionRange = null;
        }
    }

    function highlight() {
        dispatch("highlight", selectionRange);
        bookDocument.getSelection().removeAllRanges();
    }

    onDestroy(() => {
        bookDocument.removeEventListener("selectionchange", onSelectionChange);
    });
</script>

{#if selectionRange}
    <div
        id="selectionMenu"
        style="left: {position[0]}px; top: {position[1]}px;"
    >
        <button on:click={highlight}>Highlight</button>
    </div>
{/if}

<style>
    #selectionMenu {
        position: absolute;
        background: red;
        user-select: none;
        z-index: 2;
    }
</style>
