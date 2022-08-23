<script lang="ts">
    import type { Book, Contents } from "epubjs";

    export let book: Book;
    let viewContainer: HTMLElement;

    async function renderBook(view: HTMLElement, book: Book) {
        const rendition = book.renderTo(view, {
            height: "500px",
            width: "500px",
            flow: "scrolled-doc",
            allowScriptedContent: true
        });
        await rendition.display(10);

        const content: Contents = rendition.getContents()[0];
        let walker = document.createTreeWalker(content.document.body, NodeFilter.SHOW_TEXT);

        let plainText = "";
        while (walker.nextNode()) {
            plainText += walker.currentNode.textContent;
        }
        console.log(plainText);
    }
    $: if (viewContainer) renderBook(viewContainer, book);
</script>

<div class="container" bind:this={viewContainer} />

<style>
    .container {
        position: absolute;
        /* display: none; */
    }
</style>
