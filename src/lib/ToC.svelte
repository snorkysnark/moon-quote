<script lang="ts">
    import type { NavItem } from "epubjs";
    import { createEventDispatcher } from "svelte";

    export let items: NavItem[];

    const dispatch = createEventDispatcher<{ click: NavItem }>();
    function onItemClicked(item: NavItem) {
        dispatch("click", item);
    }
</script>

<ul>
    {#each items as item}
        <li>
            <button class="toc" on:click={() => onItemClicked(item)}
                >{item.label.trim()}</button
            >
            {#if item.subitems && item.subitems.length > 0}
                <svelte:self items={item.subitems} on:click />
            {/if}
        </li>
    {/each}
</ul>

<style>
    button.toc {
        border: none;
        background: none;
        text-align: left;
        text-decoration: underline;
        cursor: pointer;
    }
</style>
