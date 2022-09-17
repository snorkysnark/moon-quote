<script lang="ts">
    import type { NavItem } from "epubjs";
    import { createEventDispatcher } from "svelte";
    import type NavItemExtra from "./toc";

    export let items: NavItemExtra<boolean>[];

    const dispatch = createEventDispatcher<{ navigate: NavItem }>();
</script>

<ul>
    {#each items as item}
        {@const foldable = item.children !== null}
        <li class:foldable>
            {#if foldable}
                <button
                    class="toggle"
                    on:click={() => (item.extra = !item.extra)}
                    >{item.extra ? "▼" : "▶"}</button
                >
            {/if}
            <span id="label" on:click={() => dispatch("navigate", item.content)}
                >{item.content.label}</span
            >
        </li>
        {#if item.children && item.extra}
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
