import type { Book, NavItem } from "epubjs";

export default class TocItem {
    isOpen: boolean;
    content: NavItem;
    children: TocItem[] | null;

    constructor(content: NavItem) {
        this.isOpen = false;
        this.content = content;

        if (content.subitems && content.subitems.length > 0) {
            this.children = content.subitems.map(
                (subitem) => new TocItem(subitem)
            );
        } else {
            this.children = null;
        }
    }

    static listFromBook(book: Book) {
        return book.navigation.toc.map((item) => new TocItem(item));
    }

    setOpenRecursive(value: boolean) {
        this.isOpen = value;
        if (this.children) {
            for (const child of this.children) {
                child.setOpenRecursive(value);
            }
        }
    }
}
