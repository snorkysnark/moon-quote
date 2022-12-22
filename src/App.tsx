import { createSignal, Show } from "solid-js";
import { type BookDatabaseEntry } from "./backend/library";
import ContextMenuProvider from "./ContextMenuProvider";
import Library from "./library/Library";
import Reader from "./reader/Reader";

export default function App() {
    const [currentBook, setCurrentBook] = createSignal<BookDatabaseEntry>(null);

    return (
        <ContextMenuProvider>
            <Show
                when={currentBook()}
                fallback={<Library onBookOpen={setCurrentBook} />}
            >
                <Reader
                    bookEntry={currentBook()}
                    onExit={() => setCurrentBook(null)}
                />
            </Show>
        </ContextMenuProvider>
    );
}
