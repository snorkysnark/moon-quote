<script lang="ts">
    import { createEventDispatcher, onDestroy } from "svelte";

    export let bookDocument: Document;
    $: bookDocument.addEventListener("selectionchange", onSelectionChange);

    let selectionRange: Range = null;
    let selectionRect: DOMRect;
    $: selectionRect = selectionRange?.getBoundingClientRect();

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

    onDestroy(() => console.log("overlay destroyed"))
</script>

{#if selectionRect}
    <div
        id="selectionMenu"
        style={selectionRect
            ? `left: ${selectionRect.x + selectionRect.width / 2}px; top: ${
                  selectionRect.y - 30
              }px;`
            : ""}
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
