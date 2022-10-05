<script lang="ts">
    import { onMount } from "svelte";
    import type { Writable } from "svelte/store";

    export let store: Writable<number>;

    onMount(() => {
        store.update((value) => value + 1);
        return () => {
            store.update((value) => value - 1);
        };
    });
</script>
