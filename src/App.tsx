import { createSignal, Show } from "solid-js";
import { type BookDatabaseEntry } from "./backend/library";
import Library from "./Library";
import Reader from "./reader/Reader";
import { ReaderContextProvider } from "./reader/ReaderContextProvider";

export default function App() {
    const [currentBook, setCurrentBook] = createSignal<BookDatabaseEntry>(null);

    return (
        <Show
            when={currentBook()}
            fallback={<Library onBookOpen={setCurrentBook} />}
        >
            <ReaderContextProvider>
                <Reader
                    bookEntry={currentBook()}
                    onExit={() => setCurrentBook(null)}
                />
            </ReaderContextProvider>
        </Show>
    );
}
