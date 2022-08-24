<script lang="ts">
    import Library from "./library";
    import FileDrop from "./FileDrop.svelte";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher<{ openBook: string }>();
    const libraryPromise = Library.load();

    async function onFileDrop(library: Library, event: CustomEvent<string[]>) {
        for (const bookPath of event.detail) {
            if (bookPath.endsWith(".epub")) {
                await library.uploadBook(bookPath);
            }
        }
    }
</script>

{#await libraryPromise then library}
    <FileDrop on:fileDrop={(event) => onFileDrop(library, event)} />
{/await}
