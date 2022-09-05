<script lang="ts">
    import { onDestroy } from "svelte";

    import { openMenu, type ContextMenuItem } from "./contextmenu";

    export let target: HTMLElement;
    export let items: ContextMenuItem[];

    let closeMenu = null;
    function onRightClick(event: MouseEvent) {
        event.preventDefault();
        event.stopPropagation();
        closeMenu = openMenu({
            x: event.x,
            y: event.y,
            items,
        });
    }

    target.addEventListener("contextmenu", onRightClick);
    onDestroy(() => {
        if (closeMenu) closeMenu();
    });
</script>
