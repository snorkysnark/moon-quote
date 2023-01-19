import { batch, createSignal, onCleanup, Show } from "solid-js";
import { type BookDatabaseEntry } from "./backend/library";
import ContextMenuProvider from "./ContextMenuProvider";
import { onAnnotationLink, Target } from "./deeplink";
import Library from "./library/Library";
import Reader from "./reader/Reader";

export default function App() {
    const [currentBook, setCurrentBook] = createSignal<BookDatabaseEntry>(
        null,
        { equals: (prev, next) => prev?.bookId === next?.bookId }
    );
    const [targetLocation, setTargetLocation] = createSignal<Target>(null);

    const unsubscribe = onAnnotationLink((link) => {
        batch(() => {
            setCurrentBook(link.book);
            setTargetLocation(link.target);
        });
    });
    onCleanup(async () => {
        (await unsubscribe)();
    });

    return (
        <ContextMenuProvider>
            <Show
                when={currentBook()}
                fallback={<Library onBookOpen={setCurrentBook} />}
            >
                <Reader
                    bookEntry={currentBook()}
                    getExternalTarget={() => {
                        const target = targetLocation();
                        setTargetLocation(null);
                        return target;
                    }}
                    onExit={() => setCurrentBook(null)}
                />
            </Show>
        </ContextMenuProvider>
    );
}
