<script lang="ts">
    import type { AnnotationDatabaseEntry, BookDatabaseEntry } from "src/backend";
    import { sidePanelRight } from "src/settings";
    import AddContextMenu from "src/AddContextMenu.svelte";
    import annotationsIcon from "src/decor/annotations.svg";
    import tocIcon from "src/decor/toc.svg";
    import SidePanelContent from "./SidePanelContent.svelte";
    import type TocItem from "./toc/toc";

    export let toc: TocItem[];
    export let bookEntry: BookDatabaseEntry;
    export let annotations: AnnotationDatabaseEntry[];
    export let currentSidePanel: string = null;

    const panelTypes = [
        { name: "toc", icon: tocIcon, label: "Table of Contents" },
        { name: "annotations", icon: annotationsIcon, label: "Annotations" },
    ];

    function toggleSidePanel(name: string) {
        currentSidePanel = currentSidePanel === name ? null : name;
    }

    let panel: HTMLElement;
</script>

{#if $sidePanelRight}
    <SidePanelContent
        {currentSidePanel}
        {annotations}
        {toc}
        {bookEntry}
        on:annotationClick
        on:navigate
    />
{/if}
<div id="togglePanel" bind:this={panel}>
    {#each panelTypes as panelType}
        <button
            class="toggleButton"
            class:active={currentSidePanel === panelType.name}
            on:click={() => toggleSidePanel(panelType.name)}
            ><img
                draggable="false"
                src={panelType.icon}
                alt={panelType.label}
            /></button
        >
    {/each}
</div>
{#if !$sidePanelRight}
    <SidePanelContent
        {currentSidePanel}
        {annotations}
        {toc}
        {bookEntry}
        on:annotationClick
        on:navigate
    />
{/if}

{#if panel}
    <AddContextMenu
        target={panel}
        items={[
            {
                label: "Left Side",
                disabled: $sidePanelRight === false,
                action: () => sidePanelRight.set(false),
            },
            {
                label: "Right Side",
                disabled: $sidePanelRight === true,
                action: () => sidePanelRight.set(true),
            },
        ]}
    />
{/if}

<style>
    #togglePanel {
        flex: 0 1 auto;
        width: 40px;
        display: flex;
        flex-direction: column;
        background-color: white;
    }

    .toggleButton > img {
        width: 100%;
        object-fit: contain;
        min-width: 10px;
    }

    .toggleButton.active {
        background-color: lightblue;
    }
</style>
