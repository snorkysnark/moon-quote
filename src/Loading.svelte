<script lang="ts">
    import Spinner from "./decor/Spinner.svelte";

    export let message: string = null;
</script>

<div>
    <Spinner />
    {#if message}
        <p>{message}</p>
    {/if}
</div>

<style>
    div {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
</style>
