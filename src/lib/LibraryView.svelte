<script lang="ts">
    import * as dialog from "@tauri-apps/api/dialog";
    import * as library from "./library";
    import LibraryBook from "./LibraryBook.svelte";

    async function addBookDialog() {
        let selected = await dialog.open({
            multiple: true,
            filters: [{ name: "Epub", extensions: ["epub"] }],
        });
        if (selected === null) return;

        const bookPaths = Array.isArray(selected) ? selected : [selected];
        for (const bookPath of bookPaths) {
            await library.uploadBook(bookPath);
        }
    }
</script>

<div class="container">
    <div class="topPanel">
        <span>Library</span>
    </div>
    <div class="mainView">
        <div class="libraryGrid">
            <LibraryBook
                cover="asset:///home/lisk/Images/ae.jpg"
                name="The Listening Society"
            />
            <button class="addBook" on:click={addBookDialog}>+</button>
        </div>
    </div>
</div>

<style>
    .container {
        display: flex;
        flex-flow: column;
        width: 100%;
        height: 100vh;
    }

    .topPanel {
        background-color: orange;
    }

    .mainView {
        flex: 1 1 auto;
        min-height: 0;
    }

    .libraryGrid {
        display: grid;
        grid-template-columns: repeat(auto-fit, 200px);
        grid-auto-rows: minmax(250px, content-fit);
        align-items: center;
        justify-items: center;
        overflow-y: scroll;
    }

    .addBook {
        width: 50px;
        height: 50px;
    }
</style>
