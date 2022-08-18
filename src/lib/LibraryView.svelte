<script lang="ts">
    import Library from "./library";
    import FileDrop from "./FileDrop.svelte";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher<{ openBook: string }>();

    let books: string[] = null;
    const libraryPromise = Library.load();
    libraryPromise.then((lib) => (books = lib.getBookNames()));

    async function onFileDrop(library: Library, event: CustomEvent<string[]>) {
        for (const bookPath of event.detail) {
            if (bookPath.endsWith(".epub")) {
                await library.uploadBook(bookPath);
            }
        }
        books = library.getBookNames();
    }

    async function openBook(library: Library, bookName: string) {
        const bookPath = library.getBookPath(bookName);
        dispatch("openBook", bookPath);
    }
</script>

{#await libraryPromise then library}
    <FileDrop on:fileDrop={(event) => onFileDrop(library, event)} />
    {#each books as book}
        <button on:click={() => openBook(library, book)}>{book}</button>
    {/each}
{/await}
