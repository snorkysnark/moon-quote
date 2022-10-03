import type { NavItem } from "epubjs";
import { TreeExtended } from "./tree";

export interface NavItemFoldable {
    nav: NavItem;
    isOpen: boolean;
}

export function makeFoldable(toc: NavItem[]): TreeExtended<NavItemFoldable>[] {
    return TreeExtended.mapTreeAll(toc, (item: NavItem) => {
        return {
            nav: item,
            isOpen: false,
        };
    });
}
