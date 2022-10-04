import type { NavItem } from "epubjs";
import { makeAnnotationURL, makeChapterURL } from "src/deeplink";
import type { AnnotationInChapter, BookExtended } from "./bookExtended";
import SaxonJS from 'saxon-js';
import XML_XSLT from "./xml.xslt?raw";
import MARKDOWN_XSLT from "./markdown.xslt?raw";

function loadStylesheet(xslt: string) {
    const processor = new XSLTProcessor();
    processor.importStylesheet(
        new DOMParser().parseFromString(xslt, "application/xml")
    );
    return processor;
}

function annotationToXml(doc: XMLDocument, annotation: AnnotationInChapter) {
    const annotationElement = doc.createElement("annotation");
    annotationElement.setAttribute("url", makeAnnotationURL(annotation.data));
    annotationElement.textContent = annotation.data.textContent.trim();

    if (annotation.chapterId) {
        annotationElement.setAttribute("chapter", annotation.chapterId);
    }

    return annotationElement;
}

function navItemToXml(doc: XMLDocument, book: BookExtended, chapter: NavItem) {
    const chapterElement = doc.createElement("chapter");
    chapterElement.setAttribute("label", chapter.label.trim());
    chapterElement.setAttribute("id", chapter.id);
    chapterElement.setAttribute("url", makeChapterURL(book.dbEntry, chapter));

    if (chapter.subitems) {
        for (const child of chapter.subitems) {
            chapterElement.appendChild(navItemToXml(doc, book, child));
        }
    }
    return chapterElement;
}

function generateXml(book: BookExtended, annotations: AnnotationInChapter[]) {
    const doc = document.implementation.createDocument(null, "root", null);

    const tocElement = doc.createElement("toc");
    doc.documentElement.appendChild(tocElement);

    for (const navItem of book.epub.navigation.toc) {
        tocElement.appendChild(navItemToXml(doc, book, navItem));
    }

    const annotationsElement = doc.createElement("annotations");
    doc.documentElement.appendChild(annotationsElement);

    for (const annotation of annotations) {
        annotationsElement.appendChild(annotationToXml(doc, annotation));
    }

    return doc;
}

export function generateFormat(
    book: BookExtended,
    annotations: AnnotationInChapter[],
    xsltProcessor: XSLTProcessor
) {
    const doc = generateXml(book, annotations);

    const prettyDoc = xsltProcessor.transformToDocument(doc);
    return new XMLSerializer().serializeToString(prettyDoc);
}

export const XML = loadStylesheet(XML_XSLT);
export const MARKDOWN = loadStylesheet(MARKDOWN_XSLT);
