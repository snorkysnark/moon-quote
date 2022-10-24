<script lang="ts">
    import { state, closeMenu, type MenuItem } from "./contextmenu";

    let menuContainer: HTMLElement;
    function onClickBody(event: MouseEvent, rightClick: boolean) {
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

    function onClickItem(item: MenuItem) {
        if (item.action) item.action();
        closeMenu();
    }

    let clientWidth: number;
    let clientHeight: number;

    let position: { x: number; y: number };
    $: if ($state) {
        let mousePos = { x: $state.x, y: $state.y };

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

<svelte:body
    on:click={(e) => onClickBody(e, false)}
    on:contextmenu={(e) => onClickBody(e, true)} />

{#if $state}
    <div
        class="absolute z-10 bg-white flex flex-col shadow-lg shadow-neutral-400"
        bind:this={menuContainer}
        bind:clientWidth
        bind:clientHeight
        style:left={position.x + "px"}
        style:top={position.y + "px"}
    >
        {#each $state.items as menuItem}
            <div
                class="cursor-default select-none hover:bg-blue-100 px-2"
                on:click={() => {
                    if (!menuItem.disabled) onClickItem(menuItem);
                }}
            >
                {menuItem.label}
            </div>
        {/each}
    </div>
{/if}
