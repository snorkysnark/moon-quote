import type { NavItem } from "epubjs";
import { makeAnnotationURL, makeChapterURL } from "src/deeplink";
import type { AnnotationInChapter, BookExtended } from "./bookExtended";

export class XSLTransformer {
    processor: XSLTProcessor;
    outputMethod: "xml" | "text";

    constructor(source: string) {
        const doc = new DOMParser().parseFromString(source, "application/xml");
        if (doc.querySelector("parsererror")) {
            // parsing errors are returned in the form of XML
            throw new XMLSerializer().serializeToString(doc);
        }

        const outputMethod =
            doc.documentElement
                .getElementsByTagName("xsl:output")[0]
                ?.getAttribute("method") || "xml";

        if (outputMethod !== "xml" && outputMethod !== "text") {
            throw `Unsupported output method "${outputMethod}"`;
        }

        const processor = new XSLTProcessor();
        processor.importStylesheet(doc);

        this.processor = processor;
        this.outputMethod = outputMethod;
    }

    transform(doc: Document) {
        const newDoc = this.processor.transformToDocument(doc);
        if (!newDoc) {
            throw "Document transformation failed";
        }

        return new XMLSerializer().serializeToString(newDoc);
    }
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

export function generateXml(
    book: BookExtended,
    annotations: AnnotationInChapter[]
) {
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
