import { writable } from "svelte/store";

// If > 0, disable main (non-overlay hotkeys)
export let disableMainInput = writable(0);
