import { appWindow } from "@tauri-apps/api/window";
import {
    createResource,
    onCleanup,
    For,
    createMemo,
    createSignal,
    createEffect,
    on,
} from "solid-js";
import * as backend from "src/backend/library";

interface SearchItem {
    searchText: string;
    annotation: backend.AnnotationFull;
}

export default function Search() {
    const [annotations] = createResource(backend.getAnnotationsAll, {
        initialValue: [],
    });

    const items = createMemo(() => {
        return annotations().map((annotation) => {
            return {
                searchText: `${annotation.metaCreator}, ${annotation.metaTitle}: ${annotation.textContent}`,
                annotation,
            } as SearchItem;
        });
    });

    const [searchValue, setSearchValue] = createSignal("");
    const [filteredItems, setFilteredItems] = createSignal<SearchItem[]>([]);
    createEffect(() => {
        setFilteredItems(
            items().filter((item) =>
                item.searchText
                    .toLowerCase()
                    .includes(searchValue().toLowerCase())
            )
        );
    });

    const [selectedItem, setSelectedItem] = createSignal<number>(0);
    createEffect(
        on(filteredItems, () => {
            setSelectedItem(0);
        })
    );
    const incSelectedItem = () =>
        setSelectedItem((i) => (i === filteredItems().length - 1 ? 0 : i + 1));
    const decSelectedItem = () =>
        setSelectedItem((i) => (i === 0 ? filteredItems().length - 1 : i - 1));

    function onKeyDown(event: KeyboardEvent) {
        switch (event.key) {
            case "Escape":
                appWindow.close();
                break;
            case "ArrowDown":
                incSelectedItem();
                break;
            case "ArrowUp":
                decSelectedItem();
                break;
            case "n":
                if (event.ctrlKey) incSelectedItem();
                break;
            case "p":
                if (event.ctrlKey) decSelectedItem();
                break;
            case "Enter":
                appWindow.close();
                break;
        }
        if (event.key === "Escape") {
            appWindow.close();
        }
    }

    window.addEventListener("keydown", onKeyDown);
    onCleanup(() => {
        window.removeEventListener("keydown", onKeyDown);
    });

    let searchField: HTMLInputElement;
    return (
        <div class="select-none flex flex-col h-screen">
            <input
                ref={(input) => {
                    searchField = input;

                    // Input field loses focus after hot module reload
                    if (import.meta.hot) {
                        import.meta.hot.on("vite:afterUpdate", () => {
                            input.focus();
                        });
                    }
                }}
                onInput={(event) =>
                    setSearchValue((event.target as HTMLInputElement).value)
                }
                type="text"
                class="w-full outline-none"
                autofocus
                onBlur={() => searchField.focus()}
            />
            <div class="overflow-y-scroll flex-1">
                <For each={filteredItems()}>
                    {(item, index) => (
                        <div
                            class="flex items-stretch w-full"
                            ref={(ref) => {
                                createEffect(() => {
                                    if (index() === selectedItem()) {
                                        ref.scrollIntoView({
                                            block: "nearest",
                                        });
                                    }
                                });
                            }}
                        >
                            <div
                                class="w-2 shrink-0"
                                style={{ background: item.annotation.color }}
                            />
                            <p
                                class="p-1 cursor-default w-full"
                                classList={{
                                    "bg-gray-200":
                                        index() % 2 === 0 &&
                                        index() !== selectedItem(),
                                    "bg-yellow-500": index() === selectedItem(),
                                }}
                            >
                                {item.searchText}
                            </p>
                        </div>
                    )}
                </For>
            </div>
        </div>
    );
}
