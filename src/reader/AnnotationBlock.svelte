<script lang="ts">
    import type { AnnotationDatabaseEntry } from "src/backend";
    export let annotation: AnnotationDatabaseEntry;
</script>

<button on:click>
    <div
        id="colorMark"
        style={`background-color: var(--highlight${annotation.color});`}
    />
    <p>{annotation.textContent}</p>
</button>

<style>
    button {
        display: flex;
        align-items: stretch;
    }

    p {
        text-align: left;
    }

    #colorMark {
        flex: 0 0 auto;
        width: 10px;
        margin-right: 5px;
    }
</style>
