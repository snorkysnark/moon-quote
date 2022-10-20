<script lang="ts" context="module">
    export interface NewHighlight {
        cfi: EpubCFI;
        range: Range;
        color: number;
    }
</script>

<script lang="ts">
    import { EpubCFI, type Contents } from "epubjs";
    import { createEventDispatcher, onDestroy, onMount } from "svelte";

    export let contents: Contents;

    let bookDocument: Document;
    let selectedRange: Range;
    $: {
        bookDocument = contents.document;
        bookDocument.addEventListener("selectionchange", onSelectionChange);
    }

    function onSelectionChange() {
        const selection = bookDocument.getSelection();
        if (selection && selection.type == "Range") {
            selectedRange = selection.getRangeAt(0);
        } else {
            selectedRange = null;
        }
    }

    let position: { x: number; y: number };
    function computePosition(range: Range) {
        const rect = range.getBoundingClientRect();
        const x = rect.x + rect.width / 2;
        const y = rect.y > 30 ? rect.y - 30 : rect.y + rect.height;
        return { x, y };
    }
    $: if (selectedRange) position = computePosition(selectedRange);

    const dispatch = createEventDispatcher<{ highlight: NewHighlight }>();

    function highlight(color: number) {
        dispatch("highlight", {
            cfi: new EpubCFI(selectedRange, contents.cfiBase),
            range: selectedRange,
            color,
        });
        bookDocument.getSelection().removeAllRanges();
    }

    onMount(() => {
        onSelectionChange();
    });
    onDestroy(() => {
        bookDocument.removeEventListener("selectionchange", onSelectionChange);
    });
</script>

{#if selectedRange}
    <div id="box" style="left: {position.x}px; top: {position.y}px;">
        {#each [1, 2, 3, 4, 5] as color}
            <button
                class="highlightButton"
                style="background-color: var(--highlight{color})"
                on:click={() => highlight(color)}
            />
        {/each}
    </div>
{/if}

<style>
    #box {
        position: absolute;
        user-select: none;
        z-index: 1;

        background: white;
        padding: 5px;
        border-radius: 10px;
        box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8);
        display: flex;
        gap: 5px;
    }

    .highlightButton {
        width: 20px;
        height: 20px;
        border: none;
        border-radius: 5px;
    }

    .highlightButton:hover {
        border: solid;
    }
</style>
