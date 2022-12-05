import { createResource, For } from "solid-js";
import { type BookDatabaseEntry, getBooks } from "./backend/library";

export default function Library(props: {
    onBookOpen: (book: BookDatabaseEntry) => void;
}) {
    const [books] = createResource(getBooks);

    return (
        <ul class="list-disc list-inside p-2">
            <For each={books()}>
                {(book) => (
                    <li>
                        <button
                            class="hover:underline"
                            onClick={[props.onBookOpen, book]}
                        >
                            {book.metaTitle}
                        </button>
                    </li>
                )}
            </For>
        </ul>
    );
}
