<script lang="ts" context="module">
    interface NamedExporter {
        name: string;
        loaded: Promise<Exporter>;
    }
</script>

<script lang="ts">
    import type { UnlistenFn } from "@tauri-apps/api/event";
    import * as dialog from "@tauri-apps/api/dialog";
    import * as fs from "@tauri-apps/api/fs";
    import { openExportersFolder } from "src/backend";
    import {
        getExportersLoaded,
        onExportersReload,
        verifyOutput,
        type Exporter,
        type ExporterOutput,
        type ExportersLoaded,
    } from "src/exporters";
    import type {
        AnnotationInChapter,
        BookExtended,
    } from "src/structure/bookExtended";
    import {
        generateExportData,
        type BookExportData,
    } from "src/structure/json";
    import Code from "src/decor/Code.svelte";
    import { onMount } from "svelte";

    export let book: BookExtended;
    export let annotations: AnnotationInChapter[];

    let exportData: BookExportData;
    $: exportData = generateExportData(book, annotations);

    let exporters: ExportersLoaded = {};
    let exportersList: NamedExporter[] = [];
    let currentExporter = 0;

    // Convert templates map to list, keeping the same template selected
    $: {
        const currentExporterName = exportersList[currentExporter]?.name;

        let newCurrentExporter: number = null;
        let i = 0;
        exportersList = Object.entries(exporters).map(([name, loaded]) => {
            if (name == currentExporterName) {
                newCurrentExporter = i;
            }
            i++;
            return { name, loaded };
        });
        currentExporter = newCurrentExporter || 0;
    }

    let result: Promise<ExporterOutput>;
    // Render result / display error
    $: {
        const exporter = exportersList[currentExporter];
        if (exporter) {
            result = exporter.loaded.then((module) => {
                return verifyOutput(module.serialize(exportData));
            });
        }
    }

    async function save() {
        if (!result) return;
        const output = await result;

        const filePath = await dialog.save({
            filters: output.extension
                ? [
                      {
                          name: output.language || output.extension,
                          extensions: [output.extension],
                      },
                  ]
                : undefined,
        });

        if (filePath) {
            await fs.writeTextFile(filePath, output.content);
        }
    }

    function onKeyDown(event: KeyboardEvent) {
        switch (event.key) {
            case "ArrowUp":
                event.preventDefault();
                currentExporter = Math.max(currentExporter - 1, 0);
                break;
            case "ArrowDown":
                event.preventDefault();
                currentExporter = Math.min(
                    currentExporter + 1,
                    exportersList.length - 1
                );
                break;
            case "s":
                event.preventDefault();
                save();
                break;
        }
    }

    onMount(() => {
        let unlisten: UnlistenFn;

        (async () => {
            exporters = await getExportersLoaded();
            unlisten = await onExportersReload((message) => {
                for (const deleted of message.deleted) {
                    delete exporters[deleted];
                }
                for (const [name, loaded] of Object.entries(message.updated)) {
                    exporters[name] = loaded;
                }
                exporters = exporters;
            });
        })();

        return () => {
            if (unlisten) unlisten();
        };
    });
</script>

<svelte:window on:keydown={onKeyDown} />
<div id="window">
    <div class="block" style:flex="1 1">
        <div class="list">
            {#each exportersList as exporter, index}
                <label class:checked={index === currentExporter}>
                    <input
                        type="radio"
                        name="templates"
                        bind:group={currentExporter}
                        value={index}
                    />
                    <span>{exporter.name}</span>
                </label>
            {/each}
        </div>
        <button on:click={() => openExportersFolder()}>Edit scripts</button>
    </div>
    <div class="block" style:flex="2 1">
        {#if result}
            {#await result then output}
                <div id="preview">
                    <Code content={output.content} language={output.language} />
                </div>
                <button class="save" on:click={save}>Save</button>
            {:catch error}
                <div id="preview">{error.message}</div>
            {/await}
        {/if}
    </div>
</div>

<style>
    #window {
        background-color: white;
        border-radius: 10px;
        display: flex;
        flex-direction: row;
        padding: 5px;
        width: 80%;
        height: 80%;
    }

    .block {
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .list {
        display: flex;
        flex-direction: column;
        overflow-y: scroll;
    }

    #preview {
        flex: 1 1;
        border: inset;
        overflow: scroll;
    }

    button.save {
        height: 50px;
    }

    input {
        opacity: 0;
        position: fixed;
        width: 0;
    }

    label {
        padding: 0 5px 0 5px;
        cursor: pointer;
        display: flex;
        align-items: center;
    }

    label.checked {
        background: orange;
    }

    label > span {
        flex: 1 1;
    }
</style>
