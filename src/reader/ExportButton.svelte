<script lang="ts">
    import type { AnnotationDatabaseEntry } from "src/backend";
    import { clickOutside } from "src/utils";
    import { save } from "@tauri-apps/api/dialog";
    import { writeTextFile } from "@tauri-apps/api/fs";
    import type { BookExtended } from "src/structure/bookExtended";

    export let book: BookExtended;
    export let annotations: AnnotationDatabaseEntry[];

    let menuOpen = false;

    async function exportFile(
        name: string,
        extension: string,
        generateFn: (book: BookExtended, annotations: AnnotationDatabaseEntry[]) => string
    ) {
        const filePath = await save({
            filters: [
                {
                    name,
                    extensions: [extension],
                },
            ],
        });
        if (filePath) {
            writeTextFile(filePath, generateFn(book, annotations));
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
                    /* exportFile("XML", "xml", generateXml); */
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
        padding: 5px;
        z-index: 10;
        right: 0;
        position: absolute;
        background-color: white;
        border: solid;
        border-color: gray;

        cursor: default;
        -webkit-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }

    .menuitem:hover {
        background-color: lightblue;
    }
</style>
