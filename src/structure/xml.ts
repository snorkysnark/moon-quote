import type { NavItem } from "epubjs";
import { makeAnnotationURL, makeChapterURL } from "src/deeplink";
import type { AnnotationInChapter, BookExtended } from "./bookExtended";

const DEFAULT_XSLT = new DOMParser().parseFromString(
    `\
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:strip-space elements="*"/>
  <xsl:template match="para[content-style][not(text())]">
    <xsl:value-of select="normalize-space(.)"/>
  </xsl:template>
  <xsl:template match="node()|@*">
    <xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>
  </xsl:template>
  <xsl:output indent="yes"/>
</xsl:stylesheet>`,
    "application/xml"
);

function docToString(xmlDoc: XMLDocument) {
    const xsltProcessor = new XSLTProcessor();
    xsltProcessor.importStylesheet(DEFAULT_XSLT);
    const prettyDoc = xsltProcessor.transformToDocument(xmlDoc);
    return new XMLSerializer().serializeToString(prettyDoc);
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

    return docToString(doc);
}
