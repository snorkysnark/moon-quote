<script lang="ts">
</script>

<div id="output">
    <slot />
</div>

<style>
    #output {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        overflow: scroll;
        border: solid;
        border-width: 5px;
        border-radius: 10px;
        border-color: #3533E4;
        padding: 0 5px 0 5px;
    }
</style>
