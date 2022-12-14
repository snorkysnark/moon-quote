import { NavItem } from "epubjs";
import { For, Show } from "solid-js";
import { SetStoreFunction } from "solid-js/store";
import { useReaderContext } from "./ReaderContextProvider";

export interface NavItemFoldable {
    opened: boolean;
    label: string;
    href: string;
    subitems: NavItemFoldable[];
}

export function makeFoldableToc(
    navItems: NavItem[],
    opened: boolean
): NavItemFoldable[] {
    return navItems.map((item) => {
        return {
            opened,
            label: item.label,
            href: item.href,
            subitems: item.subitems
                ? makeFoldableToc(item.subitems, opened)
                : [],
        };
    });
}

export function ToC(props: {
    items: NavItemFoldable[];
    setToc: SetStoreFunction<NavItemFoldable[]>;
    parentPath?: any[];
}) {
    function toggleItem(path: any[]) {
        // @ts-ignore: typescript type definition only supports a limited number of arguments,
        // but code should work regardless
        props.setToc(...path, "opened", (opened) => !opened);
    }

    const { events } = useReaderContext();

    return (
        <ul>
            <For each={props.items}>
                {(item, i) => {
                    // Path to this item inside the store, for example [1, "subitems", 2]
                    const path = props.parentPath
                        ? [...props.parentPath, "subitems", i()]
                        : [i()];

                    return (
                        <li
                            classList={{
                                // Don't add margin to topmost items
                                "ml-6": path.length > 1,
                            }}
                        >
                            <div class="flex">
                                <Show when={item.subitems.length > 0}>
                                    <button
                                        class="text-xl"
                                        classList={{
                                            "rotate-90": item.opened,
                                            "translate-x-1": item.opened,
                                        }}
                                        onClick={[toggleItem, path]}
                                    >
                                        {/* Don't turn into an emoji */}
                                        ▶&#xFE0E;
                                    </button>
                                </Show>
                                <button
                                    class="hover:bg-yellow-200 text-left flex-auto"
                                    onClick={() =>
                                        events.emit("display", item.href)
                                    }
                                >
                                    {item.label}
                                </button>
                            </div>
                            <Show
                                when={item.opened && item.subitems.length > 0}
                            >
                                <ToC
                                    items={item.subitems}
                                    setToc={props.setToc}
                                    parentPath={path}
                                />
                            </Show>
                        </li>
                    );
                }}
            </For>
        </ul>
    );
}
