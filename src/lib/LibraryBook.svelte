<script lang="ts">
    import * as tauri from "@tauri-apps/api/tauri";

    export let coverPath: string | null;
    export let name: string;

    let coverUrl: string;
    $: coverUrl = coverPath ? tauri.convertFileSrc(coverPath) : null;
</script>

<button>
    {#if coverUrl}
        <img src={coverUrl} alt={name} />
    {/if}
    <p>{name}</p>
</button>

<style>
    img {
        height: 200px;
        object-fit: contain;
    }
</style>
