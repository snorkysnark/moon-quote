import { NavItem } from "epubjs";
import { For, Show } from "solid-js";
import { produce, SetStoreFunction } from "solid-js/store";
import * as clipboard from "@tauri-apps/api/clipboard";
import { toast } from "src/toast";

import { contextMenu } from "src/contextMenu";
import { makeTargetURL } from "src/backend/deeplink";
false && contextMenu;

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

function setAllItemsOpened(items: NavItemFoldable[], value: boolean) {
    for (const item of items) {
        item.opened = value;
        setAllItemsOpened(item.subitems, value);
    }
}

export function ToC(props: {
    bookId: string;
    items: NavItemFoldable[];
    setToc: SetStoreFunction<{ items: NavItemFoldable[] }>;
    onHref: (href: string) => void;
    parentPath?: any[];
}) {
    function toggleItem(path: any[]) {
        // @ts-ignore: typescript type definition only supports a limited number of arguments,
        // but code should work regardless
        props.setToc(...path, "opened", (opened) => !opened);
    }

    function unfoldAll() {
        props.setToc(produce((store) => setAllItemsOpened(store.items, true)));
    }
    function foldAll() {
        props.setToc(produce((store) => setAllItemsOpened(store.items, false)));
    }
    function copyUrl(href: string) {
        clipboard.writeText(
            makeTargetURL({ bookId: props.bookId, chapter: href })
        );
        toast("Copied URL to clipboard");
    }

    return (
        <ul>
            <For each={props.items}>
                {(item, i) => {
                    // Path to this item inside the store, for example ["items", 1, "subitems", 2]
                    const path = props.parentPath
                        ? [...props.parentPath, "subitems", i()]
                        : ["items", i()];

                    return (
                        <li
                            classList={{
                                // Don't add margin to topmost items
                                "ml-6": !!props.parentPath,
                            }}
                        >
                            <div class="flex">
                                <Show when={item.subitems.length > 0}>
                                    <button
                                        class="text-xl font-mono"
                                        classList={{
                                            "rotate-90": item.opened,
                                        }}
                                        onClick={[toggleItem, path]}
                                    >
                                        ▶
                                    </button>
                                </Show>
                                <button
                                    class="hover:bg-yellow-200 text-left flex-auto"
                                    onClick={() => props.onHref(item.href)}
                                    use:contextMenu={[
                                        {
                                            label: "URL",
                                            action: () => copyUrl(item.href),
                                        },
                                        { label: "Fold All", action: foldAll },
                                        {
                                            label: "Unfold All",
                                            action: unfoldAll,
                                        },
                                    ]}
                                >
                                    {item.label}
                                </button>
                            </div>
                            <Show
                                when={item.opened && item.subitems.length > 0}
                            >
                                <ToC
                                    bookId={props.bookId}
                                    items={item.subitems}
                                    setToc={props.setToc}
                                    onHref={props.onHref}
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
