import { Book } from "epubjs";
import EpubDisplay from "./EpubDisplay";
import { makeFoldableToc, ToC } from "./ToC";
import { createStore } from "solid-js/store";
import tocIcon from "src/decor/toc.svg";
import { createSignal, Show } from "solid-js";
import { createEvent } from "src/util/events";

const navButtonClass = "flex-auto text-4xl";

export default function ReaderView(props: { epub: Book }) {
    const [emitNext, nextListener] = createEvent<void>();
    const [emitPrev, prevListener] = createEvent<void>();
    const [emitDisplay, displayListener] = createEvent<string>();

    // Storing toc state outside of ToC component,
    // so that it persists when the panel is closed
    const [toc, setToc] = createStore(
        makeFoldableToc(props.epub.navigation.toc, true)
    );

    let [sidePanel, setSidePanel] = createSignal(false);

    return (
        <div class="flex w-full h-full min-h-0">
            <div class="bg-gray-100 w-10 shrink-0">
                <button
                    class="w-full p-2"
                    classList={{ "bg-orange-200": sidePanel() }}
                    onClick={() => setSidePanel(!sidePanel())}
                >
                    <img src={tocIcon} alt="Table of Contents" />
                </button>
            </div>
            <Show when={sidePanel()}>
                <div class="bg-blue-200 w-10 flex-grow-auto overflow-y-scroll">
                    <ToC items={toc} setToc={setToc} onHref={emitDisplay} />
                </div>
            </Show>
            <div class="flex-auto bg-gray-300 flex overflow-hidden">
                <button class={navButtonClass} onClick={() => emitPrev()}>
                    ←
                </button>
                <div class="h-full py-3 relative" style={{ width: "800px" }}>
                    <div class="bg-white h-full shadow-lg shadow-neutral-500">
                        <EpubDisplay
                            epub={props.epub}
                            nextListener={nextListener}
                            prevListener={prevListener}
                            displayListener={displayListener}
                        />
                    </div>
                </div>
                <button class={navButtonClass} onClick={() => emitNext()}>
                    →
                </button>
            </div>
        </div>
    );
}
