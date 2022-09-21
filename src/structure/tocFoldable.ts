import type { NavItem } from "epubjs";
import { TreeExtended } from "./tree";

export interface NavItemFoldable {
    nav: NavItem;
    isOpen: boolean;
}

export function makeFoldable(toc: NavItem[]) {
    return TreeExtended.mapTreeAll(toc, (item) => {
        return {
            nav: item,
            isOpen: false,
        };
    });
}
