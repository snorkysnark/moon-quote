import {
    createResource,
    createSignal,
    For,
    Match,
    Show,
    Switch,
} from "solid-js";
import { type BookEntry } from "src/backend/library";
import * as backend from "src/backend/library";
import * as path from "@tauri-apps/api/path";
import * as dialog from "@tauri-apps/api/dialog";
import { FileDropHandler } from "src/FileDropHandler";
import Loading from "src/decor/Loading";
import FileDropSplash from "src/decor/FileDropSplash";
import LibraryBook from "./LibraryBook";

export default function Library(props: {
    onBookOpen: (book: BookEntry) => void;
}) {
    const [books, { mutate: setBooks }] = createResource(backend.getBooks);

    const [uploadingBook, setUploadingBook] = createSignal<string>(null);
    const [hovering, setHovering] = createSignal(false);

    const enableFiledrop = () => books() && uploadingBook() === null;
    const enableButtons = () =>
        books() && uploadingBook() === null && !hovering();

    async function uploadBooks(bookPaths: string[]) {
        for (const bookPath of bookPaths) {
            try {
                setUploadingBook(await path.basename(bookPath));
                const newBook = await backend.uploadBook(bookPath);
                setBooks((books) => [...books, newBook]);
            } catch (error) {
                console.error(error);
            }
        }
        setUploadingBook(null);
    }

    function deleteBook(target: BookEntry) {
        setBooks((books) =>
            books.filter((other) => other.bookId !== target.bookId)
        );
        backend.deleteBook(target.bookId);
    }

    async function openUploadDialog() {
        let bookPaths = await dialog.open({
            multiple: true,
            filters: [{ name: "Epub", extensions: ["epub"] }],
        });
        if (bookPaths) {
            uploadBooks(Array.isArray(bookPaths) ? bookPaths : [bookPaths]);
        }
    }

    <Show when={enableFiledrop()}>
        <FileDropHandler
            onHover={setHovering}
            allowedExtensions={["epub"]}
            onFileDrop={uploadBooks}
        />
    </Show>;

    return (
        <div class="flex flex-col h-screen select-none">
            <div class="bg-orange-400 h-10 flex pl-1">
                <h1 class="text-2xl font-bold self-center flex-auto cursor-default">
                    Library
                </h1>
                <button
                    class="bg-gray-200 w-12 text-3xl disabled:text-gray-400"
                    disabled={!enableButtons()}
                    onClick={openUploadDialog}
                >
                    +
                </button>
            </div>
            <div class="flex-1 overflow-y-scroll">
                <Switch fallback={<Loading />}>
                    <Match when={uploadingBook()}>
                        <Loading message={`Uploading\n${uploadingBook()}`} />
                    </Match>
                    <Match when={hovering()}>
                        <FileDropSplash
                            message={"Drag and Drop\nto upload books"}
                        />
                    </Match>
                    <Match when={books()}>
                        <div class="p-2 grid gap-2 grid-cols-fit-40 auto-rows-fr">
                            <For each={books()}>
                                {(book) => (
                                    <LibraryBook
                                        entry={book}
                                        onOpen={() => props.onBookOpen(book)}
                                        onDelete={() => deleteBook(book)}
                                    />
                                )}
                            </For>
                        </div>
                    </Match>
                </Switch>
            </div>
        </div>
    );
}
