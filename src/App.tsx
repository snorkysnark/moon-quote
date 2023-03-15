import { batch, createSignal, onCleanup, Show } from "solid-js";
import { type BookEntry } from "./backend/library";
import { onAnnotationLink, DeeplinkTargetLocation } from "./backend/deeplink";
import ContextMenuProvider from "./ContextMenuProvider";
import Library from "./library/Library";
import Reader from "./reader/Reader";

export default function App() {
    const [currentBook, setCurrentBook] = createSignal<BookEntry>(null, {
        equals: (prev, next) => prev?.bookId === next?.bookId,
    });
    const [targetLocation, setTargetLocation] =
        createSignal<DeeplinkTargetLocation>(null);

    const unsubscribe = onAnnotationLink((link) => {
        batch(() => {
            setCurrentBook(link.book);
            setTargetLocation(link.location);
        });
    });
    onCleanup(unsubscribe);

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
