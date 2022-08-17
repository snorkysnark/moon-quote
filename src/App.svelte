<script lang="ts">
    import ePub from "epubjs";
    import * as fs from "@tauri-apps/api/fs";
    import FileDrop from "./lib/FileDrop.svelte";
    import type { PackagingMetadataObject } from "epubjs/types/packaging";

    interface BookInfo {
        metadata: PackagingMetadataObject;
        coverUrl: string;
    }
    let bookInfo: BookInfo = null;

    async function onFileDrop(event: CustomEvent<string[]>) {
        const file = await fs.readBinaryFile(event.detail[0]);
        const book = ePub(file.buffer);

        const metadata = await book.loaded.metadata;
        
        const coverResourceName = await book.loaded.cover;
        const coverUrl = await book.archive.createUrl(coverResourceName, {base64: false});

        bookInfo = { metadata, coverUrl };
    }
</script>

<main>
    <FileDrop on:fileDrop={onFileDrop} />
    {#if bookInfo}
        <p>Author: {bookInfo.metadata.creator}</p>
        <p>Title: {bookInfo.metadata.title}</p>
        <img class="cover" src={bookInfo.coverUrl} alt="cover">
    {/if}
</main>

<style>
    .cover {
        max-height: 500px;
    }
</style>
