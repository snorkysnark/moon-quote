<script lang="ts">
    import AddContextMenu from "src/AddContextMenu.svelte";
    import type TocItem from "./toc";
    import TocList from "./TocList.svelte";

    export let items: TocItem[];

    let container: HTMLElement;
    function setAllOpen(value: boolean) {
        for (const item of items) {
            item.setOpenRecursive(value);
        }
        items = items;
    }
</script>

<div id="container" bind:this={container}>
    <TocList {items} on:navigate />
</div>

{#if container}
    <AddContextMenu
        target={container}
        items={[
            { label: "Open All", action: () => setAllOpen(true) },
            { label: "Fold All", action: () => setAllOpen(false) },
        ]}
    />
{/if}

<style>
    #container {
        position: relative;
        left: -20px;
    }
</style>
