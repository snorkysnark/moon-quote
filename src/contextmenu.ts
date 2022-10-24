import { writable } from "svelte/store";

interface MenuItem {
    label: string;
    action?: () => void;
    disabled?: boolean;
}

interface MenuState {
    x: number;
    y: number;
    items: MenuItem[];
}

const state = writable<MenuState>(null);
const readableState = { subscribe: state.subscribe };

function closeMenu() {
    state.set(null);
}

// Use as a svelte action
function contextMenu(node: HTMLElement, items: MenuItem[]) {
    let myMenu = null;

    const handleRightClick = (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();

        myMenu = { x: event.x, y: event.y, items };
        state.set(myMenu);
    };
    node.addEventListener("contextmenu", handleRightClick);

    return {
        update(newItems: MenuItem[]) {
            items = newItems;
        },
        destroy() {
            node.removeEventListener("contextmenu", handleRightClick);

            // If the current menu is still the one opened by this action, close it
            state.update((current) => (current === myMenu ? null : current));
        },
    };
}

export type { MenuItem, MenuState };
export { contextMenu, closeMenu, readableState as state };
