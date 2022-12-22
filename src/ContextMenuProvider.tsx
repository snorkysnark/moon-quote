import {
    createContext,
    createEffect,
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

    let menuContainer: HTMLDivElement;
    createEffect(() => {
        if (menu() === null) menuContainer = null;
    });

    function onClickItem(item: MenuItem) {
        if (!item.disabled) {
            item.action?.();
            setMenu(null);
        }
    }

    function onClickBody(event: MouseEvent, rightClick: boolean) {
        if (menuContainer) {
            if (
                !rightClick &&
                (event.target === menuContainer ||
                    menuContainer.contains(event.target as Node))
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
            <Show when={menu()}>
                <Portal>
                    <div
                        class="absolute z-10 bg-white flex flex-col shadow-lg shadow-neutral-400"
                        ref={menuContainer}
                        style={{
                            left: `${menu().x}px`,
                            top: `${menu().y}px`,
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
