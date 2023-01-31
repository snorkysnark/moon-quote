import { createElementBounds } from "@solid-primitives/bounds";
import {
    createContext,
    createEffect,
    createMemo,
    createSignal,
    For,
    JSX,
    onCleanup,
    onMount,
    Setter,
    Show,
    useContext,
} from "solid-js";
import { Portal } from "solid-js/web";

export interface MenuItem {
    label: string;
    action?: () => void;
    disabled?: boolean;
}

export interface MenuState {
    x: number;
    y: number;
    items: MenuItem[];
}

const MenuContext = createContext<Setter<MenuState>>();

export default function ContextMenuProvider(props: { children?: JSX.Element }) {
    const [menu, setMenu] = createSignal<MenuState>(null);

    const [menuContainer, setMenuContainer] = createSignal<HTMLElement>(null);
    createEffect(() => {
        if (menu() === null) setMenuContainer(null);
    });
    const bodyBounds = createElementBounds(document.body);
    const containerBounds = createElementBounds(menuContainer);

    const position = createMemo(() => {
        if (!menu()) return null;

        let x = menu().x;
        let y = menu().y;

        const width = containerBounds.width || 0;
        const height = containerBounds.height || 0;
        if (x + width > bodyBounds.width) {
            x = bodyBounds.width - width;
        }
        if (y + height > bodyBounds.height) {
            y = bodyBounds.height - height;
        }
        return { x, y };
    });

    function onClickItem(item: MenuItem) {
        if (!item.disabled) {
            item.action?.();
            setMenu(null);
        }
    }

    function onClickBody(event: MouseEvent, rightClick: boolean) {
        if (menuContainer()) {
            if (
                !rightClick &&
                (event.target === menuContainer() ||
                    menuContainer().contains(event.target as Node))
            ) {
                return;
            }

            event.preventDefault();
            setMenu(null);
        }
    }

    onMount(() => {
        const onClick = (e: MouseEvent) => onClickBody(e, false);
        const onContextMenu = (e: MouseEvent) => onClickBody(e, true);

        document.body.addEventListener("click", onClick);
        document.body.addEventListener("contextmenu", onContextMenu);
        onCleanup(() => {
            document.body.removeEventListener("click", onClick);
            document.body.removeEventListener("contextmenu", onContextMenu);
        });
    });

    return (
        <>
            <Show when={menu() && position()}>
                <Portal>
                    <div
                        class="absolute z-10 bg-white flex flex-col shadow-lg shadow-neutral-400 min-w-max"
                        ref={setMenuContainer}
                        style={{
                            left: `${position().x}px`,
                            top: `${position().y}px`,
                        }}
                    >
                        <For each={menu().items}>
                            {(item) => (
                                <div
                                    class="cursor-default select-none px-2"
                                    classList={{
                                        "text-gray-500": item.disabled === true,
                                        "hover:bg-blue-100": !item.disabled,
                                    }}
                                    onClick={[onClickItem, item]}
                                >
                                    {item.label}
                                </div>
                            )}
                        </For>
                    </div>
                </Portal>
            </Show>

            <MenuContext.Provider value={setMenu}>
                {props.children}
            </MenuContext.Provider>
        </>
    );
}

export function useContextMenuSetter() {
    return useContext(MenuContext);
}
