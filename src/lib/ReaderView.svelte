<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import Reader from "./Reader.svelte";

    export let bookPath: string;

    const dispatch = createEventDispatcher<{ goBack: void }>();
</script>

<div class="container">
    <div class="leftView">
        <div class="topPanel">
            <button on:click={() => dispatch("goBack")}>&lt-</button>
            <span>Library</span>
        </div>
        <div class="readerView">
            <button class="navButton">&lt</button>
            <div class="readerSpace">
                <div class="readerPage">
                    <Reader {bookPath} />
                </div>
            </div>
            <button class="navButton">&gt</button>
        </div>
    </div>
    <div class="rightPanel"></div>
</div>

<style>
    .container {
        display: flex;
    }

    .leftView {
        display: flex;
        flex-flow: column;
        width: 100%;
        height: 100vh;
    }

    .topPanel {
        background-color: orange;
    }

    .readerView {
        flex: 1 1 auto;
        min-height: 0;
        display: flex;
    }

    .readerSpace {
        flex: 1 1 auto;
        min-height: 0;
        background-color: #E8E8E8;
        display: flex;
        justify-content: center;
    }

    .readerPage {
        background-color: white;
        width: 800px;
        height: 100%;
        box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
    }

    .rightPanel {
        min-width: 500px;
    }
</style>
