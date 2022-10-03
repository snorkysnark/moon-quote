<script lang="ts">
    import type { AnnotationDatabaseEntry } from "src/backend";
    import { sidePanelRight } from "src/settings";
    import annotationsIcon from "src/decor/annotations.svg";
    import tocIcon from "src/decor/toc.svg";
    import SidePanelContent from "./SidePanelContent.svelte";
    import type { TreeExtended } from "src/structure/tree";
    import type { NavItemFoldable } from "src/structure/tocFoldable";
    import { contextMenu } from "src/contextmenu";
    import type { BookExtended } from "src/structure/bookExtended";

    export let book: BookExtended;
    export let toc: TreeExtended<NavItemFoldable>[];
    export let annotations: AnnotationDatabaseEntry[];
    export let currentSidePanel: string = null;

    const panelTypes = [
        { name: "toc", icon: tocIcon, label: "Table of Contents" },
        { name: "annotations", icon: annotationsIcon, label: "Annotations" },
    ];

    function toggleSidePanel(name: string) {
        currentSidePanel = currentSidePanel === name ? null : name;
    }
</script>

{#if $sidePanelRight}
    <!--reusable SidePanelContent-->
    <SidePanelContent
        {currentSidePanel}
        {annotations}
        {toc}
        {book}
        on:annotationClick
        on:annotationDelete
        on:navigate
    />
    <!--end-->
{/if}
<div
    id="togglePanel"
    use:contextMenu={[
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
>
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
    <!--repeat SidePanelContent-->
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
