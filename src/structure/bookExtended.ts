import type { Book, NavItem } from "epubjs";
import type Section from "epubjs/types/section";
import type { BookDatabaseEntry } from "src/backend";

export interface Spine {
    spineByHref: { [href: string]: number };
    spineById: { [idref: string]: number };
    spineItems: Section[];
}

function* iterTocRecursive(chapters: NavItem[]): Generator<NavItem> {
    for (const chapter of chapters) {
        yield chapter;
        if (chapter.subitems) {
            yield* iterTocRecursive(chapter.subitems);
        }
    }
}

export class BookExtended {
    epub: Book;
    dbEntry: BookDatabaseEntry;
    chapterBySectionHref: Map<string, NavItem>;

    constructor(epub: Book, dbEntry: BookDatabaseEntry) {
        this.epub = epub;
        this.dbEntry = dbEntry;
        this.chapterBySectionHref = this.mapSectionHrefToChapter();
        console.log(this.chapterBySectionHref);
    }

    private mapSectionHrefToChapter() {
        const chapterBySectionHref = new Map<string, NavItem>();
        const spineItems = this.getSpine().spineItems;
        const tocFlat = [...this.iterTocFlat()];

        if (tocFlat.length > 0) {
            let lastChapter = tocFlat[0];

            // Map sections that are between 2 chapters
            for (const currentChapter of tocFlat.slice(1)) {
                for (
                    let spinePos = this.chapterSpinePos(lastChapter);
                    spinePos < this.chapterSpinePos(currentChapter);
                    spinePos++
                ) {
                    chapterBySectionHref.set(
                        spineItems[spinePos].href,
                        lastChapter
                    );
                }
                lastChapter = currentChapter;
            }

            // Sections after the last chapter belong to that chapter
            for (
                let spinePos = this.chapterSpinePos(lastChapter);
                spinePos < spineItems.length;
                spinePos++
            ) {
                chapterBySectionHref.set(
                    spineItems[spinePos].href,
                    lastChapter
                );
            }
        }
        return chapterBySectionHref;
    }

    getSpine(): Spine {
        // @ts-ignore: book.spine has wrong type definition
        return this.epub.spine;
    }

    chapterSpinePos(chapter: NavItem) {
        return this.getSpine().spineByHref[chapter.href];
    }

    *iterTocFlat(): Generator<NavItem> {
        yield* iterTocRecursive(this.epub.navigation.toc);
    }
}
