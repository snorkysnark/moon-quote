<script lang="ts">
    import { menuState, closeMenu, type ContextMenuItem } from "./contextmenu";

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

    let clientWidth: number;
    let clientHeight: number;

    let position: { x: number; y: number };
    $: if ($menuState) {
        let mousePos = { x: $menuState.x, y: $menuState.y };

        // Don't go out of bounds
        if (clientWidth && clientHeight) {
            const overflowX = clientWidth - (window.innerWidth - mousePos.x);
            const overflowY = clientHeight - (window.innerHeight - mousePos.y);

            if (overflowX > 0) mousePos.x -= overflowX;
            if (overflowY > 0) mousePos.y -= overflowY;
        }
        position = mousePos;
    }
</script>

{#if $menuState}
    <div
        id="menu"
        bind:this={menuContainer}
        bind:clientWidth
        bind:clientHeight
        style={`left: ${position.x}px; top: ${position.y}px`}
    >
        {#each $menuState.items as menuItem}
            <div
                class="menuitem"
                class:disabled={menuItem.disabled === true}
                on:click={() => {
                    if (!menuItem.disabled) onClickItem(menuItem);
                }}
            >
                {menuItem.label}
            </div>
        {/each}
    </div>
{/if}
<svelte:body
    on:click={(e) => onClickBody(e, false)}
    on:contextmenu={(e) => onClickBody(e, true)} />

<style>
    #menu {
        z-index: 10;
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

        min-width: 100px;
    }

    .menuitem {
        cursor: default;
        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;

        padding: 0px 5px 0px 5px;
    }

    .menuitem:not(.disabled):hover {
        background-color: lightblue;
    }

    .menuitem.disabled {
        color: gray;
    }
</style>
