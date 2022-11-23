<script lang="ts">
    import type { Book } from "epubjs";
    import type { AnnotationDatabaseEntry } from "src/backend/library";
    import { sidePanelRight } from "src/settings";
    import { contextMenu } from "src/contextmenu";

    export let epub: Book;
    export let annotations: AnnotationDatabaseEntry[];

    let pageWidth = 800;
</script>

<div class="flex w-full h-full" class:flex-row-reverse={$sidePanelRight}>
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
        <button class="flex-auto text-4xl">←</button>
        <div class="h-full py-3" style:width={pageWidth + "px"}>
            <div class="bg-white h-full" ></div>
        </div>
        <button class="flex-auto text-4xl">→</button>
    </div>
</div>
