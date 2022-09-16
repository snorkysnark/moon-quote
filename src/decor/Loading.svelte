<script lang="ts">
    import Spinner from "./Spinner.svelte";

    export let message: string = null;
</script>

<div>
    <Spinner />
    {#if message}
        <pre><p>{message}</p></pre>
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

    p {
        font-size: 1.5em;
        text-align: center;
    }
</style>
