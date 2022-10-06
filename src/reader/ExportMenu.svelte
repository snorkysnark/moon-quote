<script lang="ts">
    import { openTemplatesFolder } from "src/backend";
    import {
        loadTemplates,
        type TemplateLoaded,
        type TemplatesReload,
    } from "src/templates";
    import { onDestroy, onMount } from "svelte";
    import type { Result } from "src/result";
    import { generateXml } from "src/structure/xml";
    import type {
        AnnotationInChapter,
        BookExtended,
    } from "src/structure/bookExtended";
    import type { UnlistenFn } from "@tauri-apps/api/event";
    import { listen } from "@tauri-apps/api/event";

    export let book: BookExtended;
    export let annotations: AnnotationInChapter[];

    let xml: XMLDocument;
    $: xml = generateXml(book, annotations);

    let templates: TemplateLoaded[] = [];
    let currentTemplate = 0;

    let result: Result<string, Error>;
    $: {
        const template = templates[currentTemplate];
        if (template) {
            if (template.transformer.status === "ok") {
                try {
                    result = {
                        status: "ok",
                        value: template.transformer.value.transform(xml),
                    };
                } catch (error) {
                    result = {
                        status: "error",
                        error,
                    };
                }
            } else {
                // There was an error during parsing
                result = template.transformer;
            }
        }
    }

    function onKeyDown(event: KeyboardEvent) {
        switch (event.key) {
            case "ArrowUp":
                event.preventDefault();
                currentTemplate = Math.max(currentTemplate - 1, 0);
                break;
            case "ArrowDown":
                event.preventDefault();
                currentTemplate = Math.min(
                    currentTemplate + 1,
                    templates.length - 1
                );
                break;
        }
    }

    let unlisten: UnlistenFn;
    onMount(async () => {
        templates = await loadTemplates();
        unlisten = await listen<TemplatesReload>(
            "templates_reload",
            (event) => {
                console.log(event.payload);
            }
        );
    });

    onDestroy(() => {
        if (unlisten) unlisten();
    });
</script>

<svelte:window on:keydown={onKeyDown} />
<div id="window">
    <div class="block" style:flex="1 1">
        <div class="list">
            {#each templates as template, index}
                <label class:checked={index === currentTemplate}>
                    <input
                        type="radio"
                        name="templates"
                        bind:group={currentTemplate}
                        value={index}
                    />
                    <span>{template.name}</span>
                </label>
            {/each}
        </div>
        <button on:click={() => openTemplatesFolder()}>Edit templates</button>
    </div>
    <div class="block" style:flex="2 1">
        {#if result}
            {#if result.status === "ok"}
                <pre id="preview">{result.value}</pre>
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
