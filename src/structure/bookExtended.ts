import type { Book, Location, NavItem } from "epubjs";
import type Section from "epubjs/types/section";
import type { BookDatabaseEntry } from "src/backend";
import { compareCfi } from "src/utils";
import { TreeExtended } from "./tree";

export interface Spine {
    spineByHref: { [href: string]: number };
    spineById: { [idref: string]: number };
    spineItems: Section[];

    get(target: string | number): Section;
}

export interface Chapter {
    nav: NavItem;
    headerCfi: string;
    prev: TreeExtended<Chapter>;
    next: TreeExtended<Chapter>;
}

export class BookExtended {
    epub: Book;
    dbEntry: BookDatabaseEntry;
    chapters: TreeExtended<Chapter>[];
    chaptersFlat: TreeExtended<Chapter>[];
    ready: Promise<BookExtended>;

    constructor(epub: Book, dbEntry: BookDatabaseEntry) {
        this.epub = epub;
        this.dbEntry = dbEntry;
        this.ready = this.findChapterHeaders();
    }

    private async findChapterHeaders() {
        this.chapters = await TreeExtended.mapTreeAsyncAll(
            this.epub.navigation.toc,
            async (navItem: NavItem) => {
                const [sectionHref, headerId] = navItem.href.split("#");
                const section = this.getSpine().get(sectionHref);
                await section.load((path: string) => this.epub.load(path));

                const header = headerId
                    ? section.document.getElementById(headerId)
                    : section.document.body;

                return {
                    nav: navItem,
                    headerCfi: section.cfiFromElement(header),
                    prev: null,
                    next: null,
                };
            }
        );

        this.chaptersFlat = [...TreeExtended.iterAllRecursive(this.chapters)];
        for (const [index, chapter] of this.chaptersFlat.entries()) {
            chapter.data.prev = this.chaptersFlat[index - 1] || null;
            chapter.data.next = this.chaptersFlat[index + 1] || null;
        }
        return this;
    }

    getChapter(location: Location): TreeExtended<Chapter> {
        const cfi = location.start.cfi;

        let lastChapter: TreeExtended<Chapter> = null;
        for (const chapter of this.chaptersFlat) {
            if (compareCfi(chapter.data.headerCfi, cfi) > 0) {
                return lastChapter;
            }
            lastChapter = chapter;
        }
        return lastChapter;
    }

    getSpine(): Spine {
        // @ts-ignore: book.spine has wrong type definition
        return this.epub.spine;
    }
}
