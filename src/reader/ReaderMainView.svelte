<script lang="ts">
    import type { AnnotationDatabaseEntry } from "src/backend";
    import * as backend from "src/backend";
    import EpubAnnotation from "./EpubAnnotation.svelte";
    import EpubDisplay from "./EpubDisplay.svelte";
    import type { NavItem } from "epubjs";
    import { sidePanelRight } from "../settings";
    import SidePanel from "./sidePanel/SidePanel.svelte";
    import type { NewHighlight } from "./overlay/HighlighterOverlay.svelte";
    import { sortAnnotations } from "src/utils";
    import type { BookExtended } from "src/structure/bookExtended";
    import { makeFoldable } from "src/structure/tocFoldable";
    import type { Target } from "src/deeplink";

    export let book: BookExtended;
    export let annotations: AnnotationDatabaseEntry[] = [];

    let epubDisplay: EpubDisplay = null;

    export function goToTarget(target: Target) {
        switch (target.type) {
            case "Annotation":
                selectedAnnotation = target.value;
                epubDisplay.display(target.value.cfi, false, "center");
                break;
            case "Range":
                selectedAnnotation = null;
                epubDisplay.display(target.value, true, "center");
                break;
            case "Chapter":
                selectedAnnotation = null;
                epubDisplay.display(target.value);
                break;
        }
    }

    async function highlight(event: CustomEvent<NewHighlight>) {
        const { cfi, range, color } = event.detail;
        const newAnnotation = await backend.addAnnotation(
            book.dbEntry.bookId,
            cfi.toString(),
            range.toString(),
            color
        );
        annotations = sortAnnotations([...annotations, newAnnotation]);
    }

    function clearSelectedAnnotation() {
        selectedAnnotation = null;
    }

    function deleteAnnotation(event: CustomEvent<AnnotationDatabaseEntry>) {
        const target = event.detail;
        annotations = annotations.filter(
            (value) =>
                value.bookId !== target.bookId || value.cfi !== target.cfi
        );
        backend.deleteAnnotation(target.bookId, target.cfi);
        selectedAnnotation = null;
    }

    function annotationLinkClicked(
        event: CustomEvent<AnnotationDatabaseEntry>
    ) {
        const annotation = event.detail;
        epubDisplay.display(annotation.cfi, false, "center");
        selectedAnnotation = annotation;
    }

    function tocItemClicked(event: CustomEvent<NavItem>) {
        epubDisplay.display(event.detail.href);
    }

    let toc = makeFoldable(book.epub.navigation.toc);
    let selectedAnnotation: AnnotationDatabaseEntry = null;
    let currentSidePanel: string = null;
</script>

<div id="container">
    {#if !$sidePanelRight}
        <!--reusable SidePanel-->
        <SidePanel
            {book}
            {annotations}
            {toc}
            on:annotationClick={annotationLinkClicked}
            on:annotationDelete={deleteAnnotation}
            on:navigate={tocItemClicked}
            bind:currentSidePanel
        />
        <!--end-->
    {/if}
    <div id="readerView">
        <button class="navButton" on:click={() => epubDisplay.prevPage()}
            >←</button
        >
        <div id="readerPage" on:mousedown={clearSelectedAnnotation}>
            <EpubDisplay
                {book}
                {selectedAnnotation}
                bind:this={epubDisplay}
                on:highlight={highlight}
                on:mousedown={clearSelectedAnnotation}
                on:deleteAnnotation={deleteAnnotation}
            >
                {#each annotations as annotation (annotation.cfi)}
                    <EpubAnnotation
                        {annotation}
                        on:click={() => (selectedAnnotation = annotation)}
                    />
                {/each}
            </EpubDisplay>
        </div>
        <button class="navButton" on:click={() => epubDisplay.nextPage()}
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
