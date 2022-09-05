<script lang="ts">
    import Loading from "../Loading.svelte";
    import LibraryGrid from "./LibraryGrid.svelte";
    import { getBooks } from "../backend";

    let bookEntries = getBooks();
</script>

<main>
    <div id="topPanel">
        <h1>Library</h1>
    </div>
    <div id="library">
        {#await bookEntries}
            <Loading />
        {:then bookEntries}
            <LibraryGrid {bookEntries} />
        {/await}
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

    h1 {
        margin-top: 0;
        margin-left: 10px;

    }

    #topPanel {
        height: 50px;
        background-color: orange;
    }

    #library {
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: scroll;
        padding: 10px;
    }
</style>
