<script lang="ts">
    import Loading from "../Loading.svelte";
    import LibraryGrid from "./LibraryGrid.svelte";
    import FileDropHandler from "../FileDropHandler.svelte";
    import FileDropSplash from "../FileDropSplash.svelte";
    import { getBooks, type BookDatabaseEntry } from "../backend";
    import { closeMenu } from "../contextmenu";

    let bookEntries: BookDatabaseEntry[] = null;
    getBooks().then((result) => (bookEntries = result));

    let hoveringFiles: string[] = null;

    let disableUi: boolean;
    $: disableUi = bookEntries === null || hoveringFiles !== null;

    function deleteBook(target: BookDatabaseEntry) {
        bookEntries = bookEntries.filter(
            (other) => other.bookId != target.bookId
        );
    }
</script>

{#if bookEntries}
    <FileDropHandler bind:hoveringFiles />
{/if}

<main>
    <div id="topPanel">
        <h1>Library</h1>
        <button id="addBook" disabled={disableUi}>+</button>
    </div>
    <div id="library" on:scroll={closeMenu}>
        {#if hoveringFiles}
            <FileDropSplash message={"Drag and Drop\nto upload books"} />
        {:else if bookEntries}
            <LibraryGrid
                {bookEntries}
                on:delete={(e) => deleteBook(e.detail)}
            />
        {:else}
            <Loading />
        {/if}
    </div>
</main>

<style>
    main {
        display: flex;
        flex-flow: column;
        width: 100%;
        height: 100vh;

        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }

    #topPanel {
        height: 50px;
        background-color: orange;
        display: flex;
        padding-left: 5px;
        padding-right: 5px;
    }

    h1 {
        margin: 0;
        flex: 1 1 auto;
    }

    #addBook {
        width: 100px;
        font-size: 25px;
    }

    #library {
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: scroll;
        padding: 10px;
    }
</style>
