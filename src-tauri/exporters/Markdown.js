function serializeChapter(chapter, depth) {
    const marker = "#".repeat(depth);
    const title = chapter.url
        ? `${marker} [${chapter.label}](${chapter.url})`
        : `${marker} ${chapter.label}`;

    const children = chapter.children.map((child) =>
        serializeChapter(child, depth + 1)
    );
    return [title, ...children].join("\n");
}

function serializeAnnotation(annotation) {
    const blockquote = annotation.content
        .split("\n")
        .map((line) => `> ${line.trim()}  `)
        .join("\n");
    const link = `[URL](${annotation.url})`;

    return `${blockquote}
${link}`;
}

export function serialize(book) {
    const title = `# ${book.title}`;
    const chapters = book.toc.map((chapter) => serializeChapter(chapter, 2));
    const annotations = book.annotations.map(serializeAnnotation);

    const content = `${title}

${chapters.join("\n")}

# Annotations

${annotations.join("\n\n")}`;

    return {
        content,
        language: "markdown",
        extension: "md",
    };
}
