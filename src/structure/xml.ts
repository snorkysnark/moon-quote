import type { AnnotationDatabaseEntry } from "src/backend";
import { makeAnnotationURL } from "src/deeplink";
import type { AnnotatedChapter, AnnotatedToc } from "./bookExtended";
import type { TreeExtended } from "./tree";

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

function annotationToXml(
    doc: XMLDocument,
    annotation: AnnotationDatabaseEntry
) {
    const annotationElement = doc.createElement("annotation");
    annotationElement.setAttribute("url", makeAnnotationURL(annotation));
    annotationElement.textContent = annotation.textContent.trim();

    return annotationElement;
}

function chapterToXml(
    doc: XMLDocument,
    chapter: TreeExtended<AnnotatedChapter>
) {
    const chapterElement = doc.createElement("chapter");
    chapterElement.setAttribute("label", chapter.data.nav.label.trim());

    for (const annotation of chapter.data.annotations) {
        chapterElement.appendChild(annotationToXml(doc, annotation));
    }

    if (chapter.subitems) {
        for (const child of chapter.subitems) {
            chapterElement.appendChild(chapterToXml(doc, child));
        }
    }
    return chapterElement;
}

export function generateXml(toc: AnnotatedToc) {
    const doc = document.implementation.createDocument(null, "root", null);
    const root = doc.documentElement;

    // preceding annotations
    for (const annotation of toc.preceding) {
        root.appendChild(annotationToXml(doc, annotation));
    }

    for (const chapter of toc.chapters) {
        root.appendChild(chapterToXml(doc, chapter));
    }

    return docToString(doc);
}
