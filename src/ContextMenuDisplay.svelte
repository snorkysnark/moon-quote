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
    <menu
        bind:this={menuContainer}
        style={`left: ${$currentMenuStore.x}px; top: ${$currentMenuStore.y}px`}
    >
        {#each $currentMenuStore.items as menuItem}
            <menuitem>{menuItem.label}</menuitem>
        {/each}
    </menu>
{/if}
<svelte:body
    on:click={(e) => onClick(e, false)}
    on:contextmenu={(e) => onClick(e, true)} />

<style>
    menu {
        position: absolute;
        display: flex;
        flex-direction: column;
        gap: 2px;

        padding: 2px 0px 2px 0px;
        margin: 0;

        background: white;
        border: solid;
        border-color: gray;
        border-width: 2px;
        box-shadow: rgba(0, 0, 0, 0.5) 2px 2px 10px;
    }

    menuitem {
        cursor: default;
        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;

        padding: 0px 5px 0px 5px;
    }

    menuitem:hover {
        background-color: lightblue;
    }
</style>
