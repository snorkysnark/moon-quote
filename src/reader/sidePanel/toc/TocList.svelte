<script lang="ts">
    import type { NavItem } from "epubjs";
    import type { NavItemFoldable } from "src/structure/tocFoldable";
    import type { TreeExtended } from "src/structure/tree";
    import { createEventDispatcher } from "svelte";

    export let items: TreeExtended<NavItemFoldable>[];

    const dispatch = createEventDispatcher<{ navigate: NavItem }>();
</script>

<ul>
    {#each items as item}
        {@const foldable = item.subitems.length > 0}
        <li class:foldable>
            {#if foldable}
                <button
                    class="toggle"
                    on:click={() => (item.data.isOpen = !item.data.isOpen)}
                    >{item.data.isOpen ? "▼" : "▶"}</button
                >
            {/if}
            <span
                id="label"
                on:click={() => dispatch("navigate", item.data.nav)}
                >{item.data.nav.label}</span
            >
        </li>
        {#if foldable && item.data.isOpen}
            <svelte:self items={item.subitems} on:navigate />
        {/if}
    {/each}
</ul>

<style>
    ul {
        list-style-type: none;
    }

    li {
        margin: 2px 0;
    }

    #label {
        cursor: pointer;
    }

    #label:hover {
        text-decoration: underline;
    }

    .toggle {
        background: none;
        border: none;

        color: black;
        display: inline-block;
        padding: 0;
    }
</style>
