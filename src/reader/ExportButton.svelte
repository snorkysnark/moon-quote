<script lang="ts">
    import { clickOutside } from "src/utils";

    let menuOpen = false;
</script>

<div id="parent">
    <button id="dropdown" on:click={() => (menuOpen = true)}>▼ export</button>
    {#if menuOpen}
        <menu use:clickOutside on:clickOutside={() => (menuOpen = false)}>
            <menuitem>Markdown</menuitem>
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
