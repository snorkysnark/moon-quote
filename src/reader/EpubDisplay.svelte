<script lang="ts">
    import type { Book } from "epubjs";
    import type Section from "epubjs/types/section";
    import { createBlobUrl, revokeBlobUrl } from "epubjs/src/utils/core";

    export let epub: Book;
    let section: Section = null;

    function epubChanged(_epub: Book) {
        display(0);
    }
    $: epubChanged(epub);

    let html: string = null;
    async function loadHtml(section: Section) {
        html = await section.render((path) => {
            return epub.load(path);
        });
    }
    $: if (section) loadHtml(section);

    let blobUrl: string = null;
    $: {
        if (blobUrl) {
            revokeBlobUrl(blobUrl);
        }
        blobUrl = html ? createBlobUrl(html, "application/xhtml+xml") : null;
    }

    export function display(target: number) {
        section = epub.spine.get(target);
    }
</script>

<div class="w-full h-full">
    {#if blobUrl}
        <iframe src={blobUrl} frameborder="0" title={section.href} />
    {/if}
</div>
