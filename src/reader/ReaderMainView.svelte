<script lang="ts">
    import type {
        AnnotationDatabaseEntry,
        BookDatabaseEntry,
    } from "src/backend";
    import * as backend from "src/backend";
    import EpubAnnotation from "./EpubAnnotation.svelte";
    import EpubDisplay, {
        type EpubDisplayController,
        type EpubHighlightDetail,
    } from "./EpubDisplay.svelte";
    import type { Book } from "epubjs";
    import { sidePanelRight } from "../settings";
    import SidePanel from "./sidePanel/SidePanel.svelte";

    export let epub: Book;
    export let bookEntry: BookDatabaseEntry;

    let annotations: AnnotationDatabaseEntry[] = [];
    backend
        .getAnnotationsForBook(bookEntry.bookId)
        .then((loaded) => (annotations = [...annotations, ...loaded]));

    let readerController: EpubDisplayController;

    async function highlight(event: CustomEvent<EpubHighlightDetail>) {
        const { cfi, range, color } = event.detail;
        const newAnnotation = await backend.addAnnotation(
            bookEntry.bookId,
            cfi.toString(),
            range.toString(),
            color
        );
        annotations = [...annotations, newAnnotation];
    }

    function clearSelectedAnnotation() {
        selectedAnnotation = null;
    }

    function deleteHighlight(event: CustomEvent<AnnotationDatabaseEntry>) {
        const targetId = event.detail.annotationId;
        annotations = annotations.filter(
            (value) => value.annotationId != targetId
        );
        backend.deleteAnnotation(targetId);
        selectedAnnotation = null;
    }

    function annotationLinkClicked(
        event: CustomEvent<AnnotationDatabaseEntry>
    ) {
        const annotation = event.detail;
        readerController.display(annotation.cfi);
        selectedAnnotation = annotation;
    }

    let selectedAnnotation: AnnotationDatabaseEntry = null;
    let showAnnotations: boolean = false;
</script>

<div id="container">
    {#if !$sidePanelRight}
        <SidePanel
            {annotations}
            on:annotationClick={annotationLinkClicked}
            bind:showAnnotations
        />
    {/if}
    <div id="readerView">
        <button class="navButton" on:click={() => readerController.prev()}
            >←</button
        >
        <div id="readerPage" on:mousedown={clearSelectedAnnotation}>
            <EpubDisplay
                book={epub}
                {selectedAnnotation}
                bind:controller={readerController}
                on:highlight={highlight}
                on:mousedown={clearSelectedAnnotation}
                on:deleteAnnotation={deleteHighlight}
            >
                {#each annotations as annotation (annotation.annotationId)}
                    <EpubAnnotation
                        {annotation}
                        on:click={() => (selectedAnnotation = annotation)}
                    />
                {/each}
            </EpubDisplay>
        </div>
        <button class="navButton" on:click={() => readerController.next()}
            >→</button
        >
    </div>
    {#if $sidePanelRight}
        <SidePanel
            {annotations}
            on:annotationClick={annotationLinkClicked}
            bind:showAnnotations
        />
    {/if}
</div>

<style>
    #container {
        display: flex;
        width: 100%;
        height: 100%;
    }

    #readerView {
        flex: 1 1 auto;
        display: flex;
        background-color: #f1f1f1;
    }

    #readerPage {
        z-index: 1;
        margin-top: 10px;
        width: 800px;
        height: calc(100% - 20px);
        box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
        background-color: white;
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
</style>
