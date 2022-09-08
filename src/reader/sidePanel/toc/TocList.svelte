<script lang="ts">
    import type { NavItem } from "epubjs";
    import { createEventDispatcher } from "svelte";
    import type TocItem from "./toc";

    export let items: TocItem[];

    const dispatch = createEventDispatcher<{ navigate: NavItem }>();
</script>

<ul>
    {#each items as item}
        {@const foldable = item.children !== null}
        <li class:foldable>
            {#if foldable}
                <button
                    class="toggle"
                    on:click={() => (item.isOpen = !item.isOpen)}
                    >{item.isOpen ? "▼" : "▶"}</button
                >
            {/if}
            <span id="label" on:click={() => dispatch("navigate", item.content)}
                >{item.content.label}</span
            >
        </li>
        {#if item.children && item.isOpen}
            <svelte:self items={item.children} on:navigate />
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
