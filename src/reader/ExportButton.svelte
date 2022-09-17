<script lang="ts">
    import type { Book } from "epubjs";
    import type { AnnotationDatabaseEntry } from "src/backend";
    import { generateMarkdown } from "src/structure/markdown";
    import { SectionedToC } from "src/structure/sectionedToc";
    import { clickOutside } from "src/utils";
    import { save } from "@tauri-apps/api/dialog";
    import { writeTextFile } from "@tauri-apps/api/fs";

    export let epub: Book;
    export let annotations: AnnotationDatabaseEntry[];

    let menuOpen = false;

    async function saveMarkdown() {
        const filePath = await save({
            filters: [
                {
                    name: "Markdown",
                    extensions: ["md"],
                },
            ],
        });
        if (filePath) {
            writeTextFile(
                filePath,
                generateMarkdown(new SectionedToC(epub, annotations))
            );
        }
    }
</script>

<div id="parent" use:clickOutside on:clickOutside={() => (menuOpen = false)}>
    <button id="dropdown" on:click={() => (menuOpen = !menuOpen)}
        >{menuOpen ? "▲" : "▼"} export</button
    >
    {#if menuOpen}
        <menu>
            <menuitem
                on:click={() => {
                    menuOpen = false;
                    saveMarkdown();
                }}>Markdown</menuitem
            >
        </menu>
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

    menu {
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

    menuitem:hover {
        background-color: lightblue;
    }
</style>
