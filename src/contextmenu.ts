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

export const currentMenuStore = writable<ContextMenuDescriptor>(null);
export function openMenu(descriptor: ContextMenuDescriptor) {
    currentMenuStore.set(descriptor);

    return () => {
        // Call this function when menu source becomes invalid
        // (i.e. caller component gets destroyed)
        currentMenuStore.update((currentValue) => {
            // If the current menu is still the one that was originally opened, close it
            return currentValue === descriptor ? null : currentValue;
        });
    };
}

export function closeMenu() {
    currentMenuStore.set(null);
}
