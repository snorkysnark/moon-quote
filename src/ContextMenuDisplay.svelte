<script lang="ts">
    import { currentMenuStore, closeMenu } from "./contextmenu";

    let menuContainer: HTMLElement;
    function onClick(event: MouseEvent, rightClick: boolean) {
        if (menuContainer) {
            if (
                !rightClick &&
                (event.target === menuContainer ||
                    menuContainer.contains(event.target as Node))
            ) {
                return;
            }

            event.preventDefault();
            closeMenu();
        }
    }
</script>

{#if $currentMenuStore}
    <div
        bind:this={menuContainer}
        id="menuContainer"
        style={`left: ${$currentMenuStore.x}px; top: ${$currentMenuStore.y}px`}
    >
        {#each $currentMenuStore.items as menuItem}
            <div>{menuItem.label}</div>
        {/each}
    </div>
{/if}
<svelte:body
    on:click={(e) => onClick(e, false)}
    on:contextmenu={(e) => onClick(e, true)} />

<style>
    #menuContainer {
        position: absolute;
        background: white;
        border: solid;
        display: flex;
        flex-direction: column;
    }
</style>
