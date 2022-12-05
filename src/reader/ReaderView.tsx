import { Book } from "epubjs";
import EpubDisplay from "./EpubDisplay";

export default function ReaderView(props: { epub: Book }) {

    return (
        <div
            class="flex w-full h-full min-h-0"
        >
            <div
                class="bg-gray-100 w-10 shrink-0"
            />
            <div class="bg-blue-200 w-10 shrink-0" />
            <div class="flex-auto bg-gray-300 flex overflow-hidden">
                <button class="flex-auto text-4xl">←</button>
                <div class="h-full py-3 relative" style={{width: "800px"}}>
                    <div class="bg-white h-full shadow-lg shadow-neutral-500">
                        <EpubDisplay epub={props.epub} />
                    </div>
                </div>
                <button class="flex-auto text-4xl">→</button>
            </div>
        </div>
    )
}
