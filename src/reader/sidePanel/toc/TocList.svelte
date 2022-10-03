<script lang="ts">
    import type { NavItem } from "epubjs";
    import { contextMenu } from "src/contextmenu";
    import * as clipboard from "@tauri-apps/api/clipboard";
    import type { NavItemFoldable } from "src/structure/tocFoldable";
    import type { TreeExtended } from "src/structure/tree";
    import { createEventDispatcher } from "svelte";
    import { makeChapterURL } from "src/deeplink";
    import type { BookExtended } from "src/structure/bookExtended";

    export let book: BookExtended;
    export let items: TreeExtended<NavItemFoldable>[];

    const dispatch =
        createEventDispatcher<{ navigate: NavItem; foldAll: boolean }>();
</script>

<ul>
    {#each items as item (item)}
        {@const foldable = item.subitems.length > 0}
        <li
            class:foldable
            use:contextMenu={[
                {
                    label: "URL",
                    action: () =>
                        clipboard.writeText(
                            makeChapterURL(book.dbEntry, item.data.nav)
                        ),
                },
                { label: "Open All", action: () => dispatch("foldAll", true) },
                { label: "Fold All", action: () => dispatch("foldAll", false) },
            ]}
        >
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
            <svelte:self {book} items={item.subitems} on:navigate on:foldAll />
        {/if}
    {/each}
</ul>

<style>
    ul {
        list-style-type: none;
    }

    li {
        margin: 0;
        padding: 2px 0;
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
