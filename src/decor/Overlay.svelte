<script lang="ts">
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher<{ close: void }>();

    let overlay: HTMLElement;
    function onClick(event: MouseEvent) {
        if (event.target === overlay) {
            dispatch("close");
        }
    }
</script>

<div class="overlay" bind:this={overlay} on:click={onClick}>
    <slot />
</div>

<style>
    .overlay {
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 50;
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>
