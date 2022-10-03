<script lang="ts">
    import type { BookExtended } from "src/structure/bookExtended";
    import type { NavItemFoldable } from "src/structure/tocFoldable";
    import { TreeExtended } from "src/structure/tree";
    import TocList from "./TocList.svelte";

    export let book: BookExtended;
    export let items: TreeExtended<NavItemFoldable>[];

    function setAllOpen(value: boolean) {
        for (const item of TreeExtended.iterAllRecursive(items)) {
            item.data.isOpen = value;
        }
        items = items;
    }
</script>

<div id="container">
    <TocList
        {book}
        {items}
        on:navigate
        on:foldAll={(event) => setAllOpen(event.detail)}
    />
</div>

<style>
    #container {
        position: relative;
        left: -20px;
    }
</style>
