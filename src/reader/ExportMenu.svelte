<script lang="ts" context="module">
    interface NamedExporter {
        name: string;
        module: Result<Exporter, Error>;
    }
</script>

<script lang="ts">
    import { openExportersFolder } from "src/backend";
    import {
        getExportersLoaded,
        type Exporter,
        type ExporterOutput,
        type ExportersLoaded,
    } from "src/exporters";
    import type { Result } from "src/result";
    import type {
        AnnotationInChapter,
        BookExtended,
    } from "src/structure/bookExtended";
    import {
        generateExportData,
        type BookExportData,
    } from "src/structure/json";
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
        exportersList = Object.entries(exporters).map(([name, module]) => {
            if (name == currentExporterName) {
                newCurrentExporter = i;
            }
            i++;
            return { name, module };
        });
        currentExporter = newCurrentExporter || 0;
    }

    let result: Result<ExporterOutput, Error>;
    // Render result / display error
    $: {
        const exporter = exportersList[currentExporter];
        if (exporter) {
            if (exporter.module.status === "ok") {
                try {
                    result = {
                        status: "ok",
                        value: exporter.module.value.serialize(exportData),
                    };
                } catch (error) {
                    result = {
                        status: "error",
                        error,
                    };
                }
            } else {
                // There was an error during parsing
                result = exporter.module;
            }
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
        }
    }

    onMount(() => {
        (async () => {
            exporters = await getExportersLoaded();
        })();
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
            {#if result.status === "ok"}
                <pre id="preview">{result.value.content}</pre>
                <button class="save">Save</button>
            {:else}
                <pre id="preview">{result.error}</pre>
            {/if}
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
