<script lang="ts">
    import { openTemplatesFolder } from "src/backend";
    import { loadTemplates } from "src/templates";
    import { onMount } from "svelte";
    import errorIcon from "src/decor/error.png";
    import type { Result } from "src/result";
    import { generateXml, type XSLTransformer } from "src/structure/xml";
    import type {
        AnnotationInChapter,
        BookExtended,
    } from "src/structure/bookExtended";

    export let book: BookExtended;
    export let annotations: AnnotationInChapter[];

    let xml: XMLDocument;
    $: xml = generateXml(book, annotations);

    let templates: { [name: string]: Result<XSLTransformer, any> } = {};
    let selected: string = null;

    let result: Result<string, any>;
    $: {
        if (selected && templates[selected]) {
            const transformer = templates[selected];
            if (transformer.status === "ok") {
                try {
                    result = {
                        status: "ok",
                        value: transformer.value.transform(xml),
                    };
                } catch (error) {
                    result = {
                        status: "error",
                        error,
                    };
                }
            } else {
                // There was an error during parsing
                result = transformer;
            }
        }
    }

    onMount(() => {
        loadTemplates().then((loaded) => {
            templates = loaded;
            const names = Object.keys(templates);
            if (names.length > 0) {
                selected = names[0];
            }
        });
    });
</script>

<div id="window">
    <div class="block" style:flex="1 1">
        <div class="list">
            {#each Object.entries(templates) as [name, result]}
                <label>
                    <input
                        type="radio"
                        name="templates"
                        bind:group={selected}
                        value={name}
                    />
                    <span>{name}</span>
                    {#if result.status === "error"}
                        <img src={errorIcon} alt="error" class="error" />
                    {/if}
                </label>
            {/each}
        </div>
        <button on:click={() => openTemplatesFolder()}>Open folder</button>
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

    label:has(input:checked) {
        background: orange;
    }

    label > span {
        flex: 1 1;
    }

    label > img {
        height: 15px;
    }
</style>
