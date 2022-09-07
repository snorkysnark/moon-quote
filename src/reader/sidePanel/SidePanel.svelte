<script lang="ts">
    import type { AnnotationDatabaseEntry } from "src/backend";
    import AnnotationPanel from "./AnnotationPanel.svelte";
    import annotationsIcon from "src/decor/annotations.svg";
    import { sidePanelRight } from "src/settings";
    import AddContextMenu from "src/AddContextMenu.svelte";

    export let annotations: AnnotationDatabaseEntry[];
    export let showAnnotations: boolean = false;

    let panel: HTMLElement;
</script>

{#if showAnnotations && $sidePanelRight}
    <AnnotationPanel {annotations} on:annotationClick />
{/if}
<div id="sidePanelToggle" bind:this={panel}>
    <button
        class="toggle"
        class:active={showAnnotations}
        on:click={() => (showAnnotations = !showAnnotations)}
        ><img
            draggable="false"
            src={annotationsIcon}
            alt="Annotations"
        /></button
    >
</div>
{#if showAnnotations && !$sidePanelRight}
    <AnnotationPanel {annotations} on:annotationClick />
{/if}

{#if panel}
    <AddContextMenu
        target={panel}
        items={[
            { label: "Left Side", action: () => sidePanelRight.set(false) },
            { label: "Right Side", action: () => sidePanelRight.set(true) },
        ]}
    />
{/if}

<style>
    #sidePanelToggle {
        flex: 0 1 auto;
        width: 40px;
        display: flex;
        flex-direction: column;
        background-color: white;
    }

    .toggle > img {
        width: 100%;
        object-fit: contain;
    }

    .toggle.active {
        background-color: lightblue;
    }
</style>
