<script lang="ts">
    import type { NavItemFoldable } from "src/structure/tocFoldable";
    import { TreeExtended } from "src/structure/tree";
    import TocList from "./TocList.svelte";
    import { contextMenu } from "src/contextmenu";

    export let items: TreeExtended<NavItemFoldable>[];

    function setAllOpen(value: boolean) {
        for (const item of TreeExtended.iterAllRecursive(items)) {
            item.data.isOpen = value;
        }
        items = items;
    }
</script>

<div
    id="container"
    use:contextMenu={[
        { label: "Open All", action: () => setAllOpen(true) },
        { label: "Fold All", action: () => setAllOpen(false) },
    ]}
>
    <TocList {items} on:navigate />
</div>

<style>
    #container {
        position: relative;
        left: -20px;
    }
</style>
