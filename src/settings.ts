import { writable } from "svelte-local-storage-store";

// Place side panel on the right or on the left
export const sidePanelRight = writable("sidePanelRight", false);
