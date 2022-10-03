import { writable } from "svelte/store";

export interface ContextMenuDescriptor {
    x: number;
    y: number;
    items: ContextMenuItem[];
}

export interface ContextMenuItem {
    label: string;
    action?: () => void;
    disabled?: boolean;
}

const privateMenuState = writable<ContextMenuDescriptor>(null);
export const menuState = { subscribe: privateMenuState.subscribe };

function openMenu(descriptor: ContextMenuDescriptor) {
    privateMenuState.set(descriptor);

    return () => {
        // Call this function when menu source becomes invalid
        // (i.e. caller component gets destroyed)
        privateMenuState.update((currentValue) => {
            // If the current menu is still the one that was originally opened, close it
            return currentValue === descriptor ? null : currentValue;
        });
    };
}

export function closeMenu() {
    privateMenuState.set(null);
}

// Use as a svelte action
export function contextMenu(node: HTMLElement, params: ContextMenuItem[]) {
    let onDestroy = null;

    const handleRightClick = (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        onDestroy = openMenu({
            x: event.x,
            y: event.y,
            items: params,
        });
    };

    node.addEventListener("contextmenu", handleRightClick);

    return {
        update(newParams: ContextMenuItem[]) {
            params = newParams;
        },
        destroy() {
            node.removeEventListener("contextmenu", handleRightClick);
            if (onDestroy) {
                onDestroy();
            }
        },
    };
}
