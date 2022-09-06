<script lang="ts">
    import OverlayOnSelection from "./OverlayOnSelection.svelte";

    export let bookDocument: Document;
</script>

<OverlayOnSelection on:highlight {bookDocument} />
