<script lang="ts">
    import type { Book } from "epubjs";
    import { sidePanelRight } from "src/settings";
    import { contextMenu } from "src/contextmenu";
    import { resizableWidth } from "src/resizableWidth";
    import EpubDisplay from "./EpubDisplay.svelte";
    import type ReaderController from "./controller";

    export let epub: Book;

    let controller: ReaderController;
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
        <button class="navButton" on:click={() => controller.prev()}
            >←</button
        >
        <div
            class="h-full py-3 relative"
            use:resizableWidth={{
                initial: 795,
                min: 300,
                onResizeFinished: () => controller.resize("100%", "100%"),
            }}
        >
            <div class="bg-white h-full shadow-lg shadow-neutral-500">
                <EpubDisplay {epub} bind:controller />
            </div>
        </div>
        <button class="navButton" on:click={() => controller.next()}
            >→</button
        >
    </div>
</div>

<style lang="postcss">
    .navButton {
        @apply flex-auto text-4xl;
    }
</style>
