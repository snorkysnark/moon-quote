import { makeAnnotationURL } from "src/deeplink";
import NavItemExtra from "./navItem";
import type {
    AnnotatedSection,
    SectionedNavItem,
    SectionedToC,
} from "./sectionedToc";

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

function navItemToXml(doc: XMLDocument, navItem: SectionedNavItem) {
    const chapterElement = doc.createElement("chapter");
    chapterElement.setAttribute("href", navItem.content.href);
    chapterElement.textContent = navItem.content.label.trim();

    if (navItem.children) {
        for (const child of navItem.children) {
            const childElement = navItemToXml(doc, child);
            chapterElement.appendChild(childElement);
        }
    }
    return chapterElement;
}

function sectionToXml(
    doc: XMLDocument,
    section: AnnotatedSection,
    parentHref?: string
) {
    const sectionElement = doc.createElement("section");
    sectionElement.setAttribute("href", section.section.href);
    if (parentHref) {
        sectionElement.setAttribute("parentHref", parentHref);
    }

    for (const annotation of section.annotations) {
        const annotationElement = doc.createElement("annotation");
        annotationElement.setAttribute("url", makeAnnotationURL(annotation));
        annotationElement.textContent = annotation.textContent.trim();

        sectionElement.appendChild(annotationElement);
    }
    return sectionElement;
}

export function generateXml(structure: SectionedToC) {
    const xmlDoc = document.implementation.createDocument(null, "root", null);

    const tocElement = xmlDoc.createElement("toc");
    xmlDoc.documentElement.appendChild(tocElement);

    const spineElement = xmlDoc.createElement("spine");
    xmlDoc.documentElement.appendChild(spineElement);

    for (const navItem of structure.toc) {
        tocElement.appendChild(navItemToXml(xmlDoc, navItem));
    }

    // preceding sections
    for (const section of structure.preciding) {
        spineElement.appendChild(sectionToXml(xmlDoc, section));
    }
    // sections inside chapters
    for (const navItem of NavItemExtra.iterEachRecursive(structure.toc)) {
        for (const section of navItem.extra.sections) {
            spineElement.appendChild(
                sectionToXml(xmlDoc, section, navItem.content.href)
            );
        }
    }

    return docToString(xmlDoc);
}
