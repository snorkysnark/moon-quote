<script lang="ts">
    import type { AnnotationDatabaseEntry } from "src/backend";
    import { clickOutside } from "src/utils";
    import { save } from "@tauri-apps/api/dialog";
    import { writeTextFile } from "@tauri-apps/api/fs";
    import type {
        AnnotationInChapter,
        BookExtended,
    } from "src/structure/bookExtended";
    import { generateXml } from "src/structure/xml";

    export let book: BookExtended;
    export let annotations: AnnotationDatabaseEntry[];

    let annotationsInChapters: AnnotationInChapter[];
    $: annotationsInChapters = book.findChaptersForAnnotations(annotations);

    let menuOpen = false;

    async function saveDialog(
        type: string,
        extension: string
    ): Promise<string> {
        let filePath = await save({
            filters: [
                {
                    name: type,
                    extensions: [extension],
                },
            ],
        });
        return filePath;
    }

    async function exportFile(
        type: string,
        extension: string,
        content: string
    ) {
        const path = await saveDialog(type, extension);
        if (path) {
            writeTextFile(path, content);
        }
    }
</script>

<div id="parent" use:clickOutside on:clickOutside={() => (menuOpen = false)}>
    <button id="dropdown" on:click={() => (menuOpen = !menuOpen)}
        >{menuOpen ? "▲" : "▼"} export</button
    >
    {#if menuOpen}
        <div id="menu">
            <div
                class="menuitem"
                on:click={() => {
                    menuOpen = false;
                    exportFile(
                        "XML",
                        "xml",
                        generateXml(book, annotationsInChapters)
                    );
                }}
            >
                XML
            </div>
        </div>
    {/if}
</div>

<style>
    #parent {
        position: relative;
        margin: auto;
    }

    #dropdown {
        margin: 0;
        white-space: nowrap;
        height: 30px;
    }

    #menu {
        margin: 0;
        padding: 5px 0;
        z-index: 10;
        right: 0;
        min-width: 65px;
        position: absolute;
        background-color: white;
        border: solid;
        border-color: gray;

        cursor: default;
        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }

    .menuitem {
        padding: 0 5px;
    }

    .menuitem:hover {
        background-color: lightblue;
    }
</style>
