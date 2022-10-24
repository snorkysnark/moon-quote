<script lang="ts">
    import Spinner from "./Spinner.svelte";

    export let message: string = null;
</script>

<div class="w-full h-full flex flex-col items-center justify-center">
    <Spinner />
    {#if message}
        <pre><p class="text-center">{message}</p></pre>
    {/if}
</div>
