<script lang="ts">
    import {
        currentMenuStore,
        closeMenu,
        type ContextMenuItem,
    } from "./contextmenu";

    let menuContainer: HTMLElement;
    function onClickBody(event: MouseEvent, rightClick: boolean) {
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

    function onClickItem(item: ContextMenuItem) {
        if (item.action) item.action();
        closeMenu();
    }
</script>

{#if $currentMenuStore}
    <menu
        bind:this={menuContainer}
        style={`left: ${$currentMenuStore.x}px; top: ${$currentMenuStore.y}px`}
    >
        {#each $currentMenuStore.items as menuItem}
            <menuitem on:click={() => onClickItem(menuItem)}
                >{menuItem.label}</menuitem
            >
        {/each}
    </menu>
{/if}
<svelte:body
    on:click={(e) => onClickBody(e, false)}
    on:contextmenu={(e) => onClickBody(e, true)} />

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
