import { Book } from "epubjs";
import EpubDisplay from "./EpubDisplay";
import { useReaderContext } from "./ReaderContextProvider";
import { makeFoldableToc, ToC } from "./ToC";
import { createStore } from "solid-js/store";

const navButtonClass = "flex-auto text-4xl";

export default function ReaderView(props: { epub: Book }) {
    const context = useReaderContext();

    // Storing toc state outside of ToC component,
    // so that it persists when the panel is closed
    const [toc, setToc] = createStore(
        makeFoldableToc(props.epub.navigation.toc, true)
    );

    return (
        <div class="flex w-full h-full min-h-0">
            <div class="bg-gray-100 w-10 shrink-0" />
            <div class="bg-blue-200 w-10 flex-grow-auto overflow-y-scroll">
                <ToC items={toc} setToc={setToc} />
            </div>
            <div class="flex-auto bg-gray-300 flex overflow-hidden">
                <button
                    class={navButtonClass}
                    onClick={() => context.events.emit("prev")}
                >
                    ←
                </button>
                <div class="h-full py-3 relative" style={{ width: "800px" }}>
                    <div class="bg-white h-full shadow-lg shadow-neutral-500">
                        <EpubDisplay epub={props.epub} />
                    </div>
                </div>
                <button
                    class={navButtonClass}
                    onClick={() => context.events.emit("next")}
                >
                    →
                </button>
            </div>
        </div>
    );
}
