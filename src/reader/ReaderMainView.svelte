<script lang="ts">
    import type {
        AnnotationDatabaseEntry,
        BookDatabaseEntry,
    } from "src/backend";
    import * as backend from "src/backend";
    import EpubAnnotation from "./EpubAnnotation.svelte";
    import EpubDisplay, {
        type EpubDisplayController,
    } from "./EpubDisplay.svelte";
    import type { Book, NavItem } from "epubjs";
    import { sidePanelRight } from "../settings";
    import SidePanel from "./sidePanel/SidePanel.svelte";
    import TocItem from "./sidePanel/toc/toc";
    import type { NewHighlight } from "./overlay/HighlighterOverlay.svelte";

    export let epub: Book;
    export let annotations: AnnotationDatabaseEntry[] = [];
    export let bookEntry: BookDatabaseEntry;
    export let goToAnnotation: AnnotationDatabaseEntry;

    $: if (goToAnnotation && readerController) {
        selectedAnnotation = goToAnnotation;
        readerController.display(goToAnnotation.cfi.toString());
    }

    let readerController: EpubDisplayController;

    async function highlight(event: CustomEvent<NewHighlight>) {
        const { cfi, range, color } = event.detail;
        const newAnnotation = await backend.addAnnotation(
            bookEntry.bookId,
            cfi,
            range.toString(),
            color
        );
        annotations = [...annotations, newAnnotation];
    }

    function clearSelectedAnnotation() {
        selectedAnnotation = null;
    }

    function deleteAnnotation(event: CustomEvent<AnnotationDatabaseEntry>) {
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
        readerController.display(annotation.cfi.toString());
        selectedAnnotation = annotation;
    }

    function tocItemClicked(event: CustomEvent<NavItem>) {
        readerController.display(event.detail.href);
    }

    let toc = TocItem.listFromBook(epub);
    let selectedAnnotation: AnnotationDatabaseEntry = null;
    let currentSidePanel: string = null;
</script>

<div id="container">
    {#if !$sidePanelRight}
        <!--reusable SidePanel-->
        <SidePanel
            {annotations}
            {toc}
            on:annotationClick={annotationLinkClicked}
            on:navigate={tocItemClicked}
            bind:currentSidePanel
        />
        <!--end-->
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
                on:deleteAnnotation={deleteAnnotation}
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
        <!--repeat SidePanel-->
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
