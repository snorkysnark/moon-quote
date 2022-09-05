<script lang="ts">
    import type { Book } from "epubjs";
    import type {
        AnnotationDatabaseEntry,
        BookDatabaseEntry,
        LoadedBook,
    } from "src/backend";
    import annotationsIcon from "../decor/annotations.svg";

    export let book: LoadedBook;

    let epub: Book;
    let annotations: AnnotationDatabaseEntry[];
    let bookEntry: BookDatabaseEntry;
    $: {
        epub = book.epub;
        annotations = book.annotations;
        bookEntry = book.entry;
    }
</script>

<div id="container">
    <div id="readerView">
        <button class="navButton">←</button>
        <div id="readerPage" />
        <button class="navButton">→</button>
    </div>
    <!--<div id="sidePanel">-->
        <!--aowihfiwohf-->
    <!--</div>-->
    <div id="sidePanelToggle">
        <button class="toggle"
            ><img
                draggable="false"
                src={annotationsIcon}
                alt="Annotations"
            /></button
        >
    </div>
</div>

<style>
    #container {
        display: flex;
        width: 100%;
        height: 100%;
    }

    #readerView {
        flex: 1 1 auto;
        height: 100%;
        display: flex;
    }

    #readerPage {
        z-index: 1;
        margin-top: 10px;
        background-color: white;
        width: 800px;
        height: calc(100% - 20px);
        box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
    }

    .navButton {
        flex: 1 1 auto;
        border: none;
        outline: none;
        background: none;
        margin: 0;
        color: #b8b8b8;
        font-size: 50px;
        user-select: none;
        cursor: pointer;
    }

    #sidePanel {
        flex: 0 1 auto;
        background-color: lightblue;
    }

    #sidePanelToggle {
        flex: 0 1 auto;
        width: 50px;
        display: flex;
        flex-direction: column;
    }

    .toggle > img {
        width: 100%;
        object-fit: contain;
    }
</style>
