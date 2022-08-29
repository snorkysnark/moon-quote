<script lang="ts">
    export let cover: string;
    export let name: string;
</script>

<button>
    <img src={cover} alt={name}>
    <p>{name}</p>
</button>

<style>
    img {
        height: 200px;
        object-fit: contain;
    }
</style>
