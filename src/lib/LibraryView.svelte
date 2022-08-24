<script lang="ts">
    /* import Library from "./library"; */
    /* import FileDrop from "./FileDrop.svelte"; */
    import * as dialog from "@tauri-apps/api/dialog";
    /* import { createEventDispatcher } from "svelte"; */

    /* const dispatch = createEventDispatcher<{ openBook: string }>(); */
    /* const libraryPromise = Library.load(); */

    async function addBookDialog() {
        const selected = await dialog.open({
            multiple: true,
            filters: [{ name: "Epub", extensions: ["epub"] }],
        });
        console.log(selected);
    }
</script>

<div class="container">
    <div class="topPanel">
        <span>Library</span>
    </div>
    <div class="mainView">
        <button on:click={addBookDialog}>+</button>
    </div>
</div>

<style>
    .container {
        display: flex;
        flex-flow: column;
        width: 100%;
        height: 100vh;
    }

    .mainView {
        flex: 1 1 auto;
        min-height: 0;
    }

    .topPanel {
        background-color: orange;
    }
</style>
