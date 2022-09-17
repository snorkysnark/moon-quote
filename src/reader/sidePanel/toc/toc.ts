import type { NavItem } from "epubjs";

// Attach extra data to each NavItem
export default class NavItemExtra<T> {
    content: NavItem;
    extra: T;
    children: NavItemExtra<T>[] | null;

    constructor(item: NavItem, extend: (item: NavItem) => T) {
        this.content = item;
        this.extra = extend(item);
        if (item.subitems && item.subitems.length > 0) {
            this.children = item.subitems.map(
                (subitem) => new NavItemExtra(subitem, extend)
            );
        } else {
            this.children = null;
        }
    }

    static createList<T>(
        toc: NavItem[],
        extend: (item: NavItem) => T
    ): NavItemExtra<T>[] {
        return toc.map((item) => new NavItemExtra(item, extend));
    }

    *iterRecursive() {
        yield this;
        if (this.children) {
            yield* this.children;
        }
    }

    static *iterEachRecursive<T>(list: NavItemExtra<T>[]) {
        for (const item of list) {
            yield* item.iterRecursive();
        }
    }
}
