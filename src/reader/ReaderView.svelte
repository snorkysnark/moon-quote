<script lang="ts">
    import type { Book } from "epubjs";
    import { sidePanelRight } from "src/settings";
    import { contextMenu } from "src/contextmenu";
    import EpubDisplay from "./EpubDisplay.svelte";

    export let epub: Book;

    let rendition: EpubDisplay;
</script>

<div
    class="flex w-full h-full min-h-0"
    class:flex-row-reverse={$sidePanelRight}
>
    <div
        class="bg-gray-100 w-10 shrink-0"
        use:contextMenu={[
            {
                label: "Left Side",
                disabled: $sidePanelRight === false,
                action: () => sidePanelRight.set(false),
            },
            {
                label: "Right Side",
                disabled: $sidePanelRight === true,
                action: () => sidePanelRight.set(true),
            },
        ]}
    />
    <div class="bg-blue-200 w-10 shrink-0" />
    <div class="flex-auto bg-gray-300 flex overflow-hidden">
        <button class="navButton">←</button>
        <div class="h-full py-3 relative" style:width="800px">
            <div class="bg-white h-full shadow-lg shadow-neutral-500">
                <EpubDisplay {epub} bind:this={rendition} />
            </div>
        </div>
        <button class="navButton">→</button>
    </div>
</div>

<style lang="postcss">
    .navButton {
        @apply flex-auto text-4xl;
    }
</style>
