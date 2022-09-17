import type { AnnotationDatabaseEntry } from "src/backend";
import { makeAnnotationURL } from "src/deeplink";
import type { SectionedNavItem, SectionedToC } from "./sectionedToc";

function writeAnnotation(annotation: AnnotationDatabaseEntry) {
    const blockquote = annotation.textContent
        .split("\n")
        .map((line) => `> ${line.trim()}  `)
        .join("\n");

    const link = `[Annotation ${annotation.annotationId}](${makeAnnotationURL(annotation)})`;

    return `${blockquote}

${link}`;
}

function writeChapter(chapter: SectionedNavItem, level: number = 1) {
    const headerMarker = "#".repeat(level || 1);
    const title = chapter.content.label.trim().replace("\n", "");
    const header = `${headerMarker} ${title}`;

    const annotations = [];
    for (const section of chapter.extra.sections) {
        for (const annotation of section.annotations) {
            annotations.push(writeAnnotation(annotation));
        }
    }

    let children = [];
    if (chapter.children) {
        for (const child of chapter.children) {
            children.push(writeChapter(child, level + 1));
        }
    }

    return `${header}
${annotations.join("\n")}
${children.join("\n")}`;
}

export function generateMarkdown(structure: SectionedToC): string {
    const precedindAnnotations = [];
    for (const section of structure.preciding) {
        for (const annotation of section.annotations) {
            precedindAnnotations.push(writeAnnotation(annotation));
        }
    }

    const chapters = structure.toc.map((chapter) => writeChapter(chapter));

    return `${precedindAnnotations.join("\n")}
${chapters.join("\n")}`;
}
