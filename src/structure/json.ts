import type { NavItem } from "epubjs";
import { makeAnnotationURL, makeChapterURL } from "src/deeplink";
import type { AnnotationInChapter, BookExtended } from "./bookExtended";

export interface ChapterExportData {
    label: string;
    id: string;
    url: string;
    children: ChapterExportData[];
}

export interface AnnotationExportData {
    url: string;
    chapter: string;
    content: string;
}

export interface BookExportData {
    title: string;
    author: string;

    toc: ChapterExportData[];
    annotations: AnnotationExportData[];
}

function generateChapterData(
    book: BookExtended,
    chapter: NavItem
): ChapterExportData {
    return {
        label: chapter.label.trim(),
        id: chapter.id,
        url: makeChapterURL(book.dbEntry, chapter),
        children: (chapter.subitems || []).map((child) =>
            generateChapterData(book, child)
        ),
    };
}

function generateAnnotationData(
    annotation: AnnotationInChapter
): AnnotationExportData {
    return {
        url: makeAnnotationURL(annotation.data),
        chapter: annotation.chapterId,
        content: annotation.data.textContent.trim(),
    };
}

export function generateExportData(
    book: BookExtended,
    annotations: AnnotationInChapter[]
): BookExportData {
    return {
        title: book.dbEntry.metaTitle,
        author: book.dbEntry.metaCreator,

        toc: book.epub.navigation.toc.map((chapter) =>
            generateChapterData(book, chapter)
        ),
        annotations: annotations.map(generateAnnotationData),
    };
}
