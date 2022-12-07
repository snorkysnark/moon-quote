import { Book } from "epubjs";
import EpubRendition, { Controller } from "./EpubRendition";

const navButtonClass = "flex-auto text-4xl";

export default function ReaderView(props: { epub: Book }) {
    let controller: Controller;

    return (
        <div class="flex w-full h-full min-h-0">
            <div class="bg-gray-100 w-10 shrink-0" />
            <div class="bg-blue-200 w-10 shrink-0" />
            <div class="flex-auto bg-gray-300 flex overflow-hidden">
                <button
                    class={navButtonClass}
                    onClick={() => controller.prev()}
                >
                    ←
                </button>
                <div class="h-full py-3 relative" style={{ width: "800px" }}>
                    <div class="bg-white h-full shadow-lg shadow-neutral-500">
                        <EpubRendition
                            epub={props.epub}
                            setController={(c) => (controller = c)}
                        />
                    </div>
                </div>
                <button
                    class={navButtonClass}
                    onClick={() => controller.next()}
                >
                    →
                </button>
            </div>
        </div>
    );
}
