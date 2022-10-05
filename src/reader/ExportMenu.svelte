<script lang="ts">
    import { openTemplatesFolder } from "src/backend";
</script>

<div id="window">
    <div class="block" style:flex="1 1">
        <div class="list">
            <label>
                <input type="radio" name="templates" />
                XML
            </label>
            <label>
                <input type="radio" name="templates" />
                Markdown
            </label>
        </div>
        <button on:click={() => openTemplatesFolder()}>Open folder</button>
    </div>
    <div class="block" style:flex="2 1">
        <div id="preview">Preview Text</div>
        <button class="save">Save</button>
    </div>
</div>

<style>
    #window {
        background-color: white;
        border-radius: 10px;
        display: flex;
        flex-direction: row;
        padding: 5px;
        width: min(80%, 800px);
        height: min(60%, 600px);
    }

    .block {
        display: flex;
        flex-direction: column;
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
        padding-left: 5px;
        cursor: pointer;
    }

    label:has(input:checked) {
        background: orange;
    }
</style>
