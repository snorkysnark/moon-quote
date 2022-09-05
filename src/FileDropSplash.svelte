<script lang="ts">
    export let message: string;
</script>

<div id="box">
    <pre><p>{message}</p></pre>
</div>

<style>
    #box {
        box-sizing: border-box;
        width: calc(100% - 40px);
        height: calc(100% - 40px);
        margin: 20px;
        border: dotted;

        display: flex;
        align-items: center;
        justify-content: center;
    }

    p {
        font-size: 2em;
        text-align: center;
    }
</style>
