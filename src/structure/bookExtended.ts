import type { Book, NavItem } from "epubjs";
import type Section from "epubjs/types/section";
import type { BookDatabaseEntry } from "src/backend";
import { iterTreesFlat } from "./tree";

export interface Spine {
    spineByHref: { [href: string]: number };
    spineById: { [idref: string]: number };
    spineItems: Section[];
}

export interface Chapter {
    nav: NavItem | null;
    sections: Section[];
}

export class BookExtended {
    epub: Book;
    dbEntry: BookDatabaseEntry;
    chapters: Chapter[];
    chapterByHref: Map<string, Chapter>;

    constructor(epub: Book, dbEntry: BookDatabaseEntry) {
        this.epub = epub;
        this.dbEntry = dbEntry;
        this.splitChaptersIntoSections();
    }

    private splitChaptersIntoSections() {
        const spineItems = this.getSpine().spineItems;
        const navItems = [...iterTreesFlat(this.epub.navigation.toc)];
        const chapters = [];
        const chapterByHref = new Map<string, Chapter>();

        if (navItems.length > 0) {
            // sections preceding the first NavItem
            const firstChapterPos = this.chapterSpinePos(navItems[0]);
            if (firstChapterPos > 0) {
                const chapter = { nav: null, sections: [] };
                for (let pos = 0; pos < firstChapterPos; pos++) {
                    const section = spineItems[pos];
                    chapter.sections.push(section);
                    chapterByHref.set(section.href, chapter);
                }
                chapters.push(chapter);
            }

            // sections between 2 NavItems
            let lastNavItem = navItems[0];
            for (const navItem of navItems.slice(1)) {
                const chapter = { nav: lastNavItem, sections: [] };
                for (
                    let pos = this.chapterSpinePos(lastNavItem);
                    pos < this.chapterSpinePos(navItem);
                    pos++
                ) {
                    const section = spineItems[pos];
                    chapter.sections.push(section);
                    chapterByHref.set(section.href, chapter);
                }
                chapters.push(chapter);
                lastNavItem = navItem;
            }

            // sections after the last NavItem
            const finalChapter = { nav: lastNavItem, sections: [] };
            for (
                let pos = this.chapterSpinePos(lastNavItem);
                pos < spineItems.length;
                pos++
            ) {
                const section = spineItems[pos];
                finalChapter.sections.push(section);
                chapterByHref.set(section.href, finalChapter);
            }
        }
        this.chapters = chapters;
        this.chapterByHref = chapterByHref;
    }

    getSpine(): Spine {
        // @ts-ignore: book.spine has wrong type definition
        return this.epub.spine;
    }

    chapterSpinePos(chapter: NavItem) {
        return this.getSpine().spineByHref[chapter.href];
    }
}
