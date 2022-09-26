import type { Book, Location, NavItem } from "epubjs";
import type Section from "epubjs/types/section";
import type { BookDatabaseEntry } from "src/backend";
import { compareCfi } from "src/utils";
import { iterTreesFlat } from "./tree";

export interface Spine {
    spineByHref: { [href: string]: number };
    spineById: { [idref: string]: number };
    spineItems: Section[];

    get(target: string | number): Section;
}

export interface Chapter {
    nav: NavItem;
    headerCfi: string;
}

export class BookExtended {
    epub: Book;
    dbEntry: BookDatabaseEntry;
    chapters: Chapter[];
    ready: Promise<BookExtended>;

    constructor(epub: Book, dbEntry: BookDatabaseEntry) {
        this.epub = epub;
        this.dbEntry = dbEntry;
        this.ready = this.findChapterHeaders();
    }

    private async findChapterHeaders() {
        this.chapters = [];

        for (const navItem of iterTreesFlat(this.epub.navigation.toc)) {
            const [sectionHref, headerId] = navItem.href.split("#");
            const section = this.getSpine().get(sectionHref);
            await section.load((path: string) => this.epub.load(path));

            const header = headerId
                ? section.document.getElementById(headerId)
                : section.document.body;

            const chapter = {
                nav: navItem,
                headerCfi: section.cfiFromElement(header),
            };

            this.chapters.push(chapter);
        }
        return this;
    }

    getChapter(location: Location): Chapter {
        const cfi = location.start.cfi;

        let lastChapter = null;
        for (const chapter of this.chapters) {
            if (compareCfi(chapter.headerCfi, cfi) > 0) {
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
