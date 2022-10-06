<script lang="ts" context="module">
    interface Template {
        name: string;
        transformer: Result<XSLTransformer, Error>;
    }
</script>

<script lang="ts">
    import { openTemplatesFolder } from "src/backend";
    import {
        loadTemplates,
        onTemplatesReload,
        type TemplatesLoaded,
    } from "src/templates";
    import { onMount } from "svelte";
    import type { Result } from "src/result";
    import { generateXml, XSLTransformer } from "src/structure/xml";
    import type {
        AnnotationInChapter,
        BookExtended,
    } from "src/structure/bookExtended";
    import type { UnlistenFn } from "@tauri-apps/api/event";

    export let book: BookExtended;
    export let annotations: AnnotationInChapter[];

    let xml: XMLDocument;
    $: xml = generateXml(book, annotations);

    let templates: TemplatesLoaded = {};
    let templatesList: Template[] = [];
    let currentTemplate = 0;

    // Convert templates map to list, keeping the same template selected
    $: {
        const currentTemplateName = templatesList[currentTemplate]?.name;

        let newCurrentTemplate: number = null;
        let i = 0;
        templatesList = Object.entries(templates).map(([name, transformer]) => {
            if (name == currentTemplateName) {
                newCurrentTemplate = i;
            }
            i++;
            return { name, transformer };
        });
        currentTemplate = newCurrentTemplate || 0;
    }

    let result: Result<string, Error>;
    // Render result / display error
    $: {
        const template = templatesList[currentTemplate];
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
                    templatesList.length - 1
                );
                break;
        }
    }

    onMount(() => {
        let unlisten: UnlistenFn;

        (async () => {
            templates = await loadTemplates();
            unlisten = await onTemplatesReload((message) => {
                for (const deleted of message.deleted) {
                    delete templates[deleted];
                }
                for (const [name, transformer] of Object.entries(
                    message.updated
                )) {
                    templates[name] = transformer;
                }
                templates = templates;
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
            {#each templatesList as template, index}
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
