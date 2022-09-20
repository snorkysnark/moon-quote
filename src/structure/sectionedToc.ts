import { EpubCFI, type Book } from "epubjs";
import type Section from "epubjs/types/section";
import type { AnnotationDatabaseEntry } from "src/backend";
import NavItemExtra from "./navItem";

export interface AnnotatedSection {
    section: Section;
    spinePos: number;
    annotations: AnnotationDatabaseEntry[];
}

export interface SectionData {
    spinePos: number;
    sections: AnnotatedSection[];
}

export type SectionedNavItem = NavItemExtra<SectionData>;

function mapAnnotationsBySpinePos(
    annotations: AnnotationDatabaseEntry[]
): Map<number, AnnotationDatabaseEntry[]> {
    const annotationsBySpinePos = new Map<number, AnnotationDatabaseEntry[]>();

    for (const annotation of annotations) {
        const spinePos = new EpubCFI(annotation.cfi).spinePos;

        if (!annotationsBySpinePos.has(spinePos)) {
            annotationsBySpinePos.set(spinePos, []);
        }
        annotationsBySpinePos.get(spinePos).push(annotation);
    }
    return annotationsBySpinePos;
}

export class SectionedToC {
    preciding: AnnotatedSection[];
    toc: SectionedNavItem[];

    constructor(book: Book, annotations: AnnotationDatabaseEntry[]) {
        // @ts-ignore: book.spine has wrong type annotations
        const spineByHref: { [href: string]: number } = book.spine.spineByHref;
        // @ts-ignore: book.spine has wrong type annotations
        const spineItems: Section[] = book.spine.items;

        // Attach spine position data to each NavItem
        const navItems: SectionedNavItem[] = NavItemExtra.createList(
            book.navigation.toc,
            (item) => {
                return {
                    spinePos: spineByHref[item.href],
                    sections: [],
                };
            }
        );
        // Flatten NavItems tree
        const navItemsFlat = [...NavItemExtra.iterEachRecursive(navItems)];

        // Sections before the first ToC item
        const precedingSections: AnnotatedSection[] = [];

        if (navItemsFlat.length > 0) {
            for (
                let currentPos = 0;
                currentPos < navItemsFlat[0].extra.spinePos;
                currentPos++
            ) {
                precedingSections.push({
                    section: spineItems[currentPos],
                    spinePos: currentPos,
                    annotations: [],
                });
            }

            // Associate each ToC item with a list of sections
            let lastNavItem = navItemsFlat[0];
            for (let i = 1; i < navItemsFlat.length; i++) {
                const currentNavItem = navItemsFlat[i];
                for (
                    let currentPos = lastNavItem.extra.spinePos;
                    currentPos < currentNavItem.extra.spinePos;
                    currentPos++
                ) {
                    lastNavItem.extra.sections.push({
                        section: spineItems[currentPos],
                        spinePos: currentPos,
                        annotations: [],
                    });
                }
                lastNavItem = currentNavItem;
            }
            // Sections after the last chapter
            for (
                let currentPos = lastNavItem.extra.spinePos;
                currentPos < spineItems.length;
                currentPos++
            ) {
                lastNavItem.extra.sections.push({
                    section: spineItems[currentPos],
                    spinePos: currentPos,
                    annotations: [],
                });
            }
        }

        const annotationsBySpinePos = mapAnnotationsBySpinePos(annotations);
        for (const section of precedingSections) {
            section.annotations =
                annotationsBySpinePos.get(section.spinePos) || [];
        }
        for (const navItem of navItemsFlat) {
            for (const section of navItem.extra.sections) {
                section.annotations =
                    annotationsBySpinePos.get(section.spinePos) || [];
            }
        }

        this.preciding = precedingSections;
        this.toc = navItems;
    }
}
