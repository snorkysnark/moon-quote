import { Accessor, onCleanup } from "solid-js";
import {
    MenuItem,
    MenuState,
    useContextMenuSetter,
} from "./ContextMenuProvider";

export function contextMenu(node: HTMLElement, items: Accessor<MenuItem[]>) {
    const setMenuState = useContextMenuSetter();

    let myMenu: MenuState = null;

    const handleRightClick = (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();

        myMenu = { x: event.x, y: event.y, items: items() };
        setMenuState(myMenu);
    };
    node.addEventListener("contextmenu", handleRightClick);

    onCleanup(() => {
        node.removeEventListener("contextmenu", handleRightClick);

        // If the current menu is still the one opened by this action, close it
        setMenuState((current) => (current === myMenu ? null : current));
    });
}

declare module "solid-js" {
    namespace JSX {
        interface Directives {
            contextMenu: MenuItem[];
        }
    }
}
