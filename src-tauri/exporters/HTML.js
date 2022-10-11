import { html_beautify } from "https://cdn.skypack.dev/js-beautify";

function makeHeading(title, url, depth) {
    const heading = document.createElement("h" + depth);
    if (url) {
        const link = document.createElement("a");
        link.textContent = title;
        link.setAttribute("href", url)
        heading.appendChild(link);
    } else {
        heading.textContent = title;
    }
    return heading;
}

function* serializeToc(toc, depth) {
    for (const chapter of toc) {
        yield makeHeading(chapter.label, chapter.url, depth);
        yield* serializeToc(chapter.children, depth + 1);
    }
}

function serializeAnnotation(annotation) {
    const block = document.createElement("blockquote");
    block.textContent = annotation.content;

    const link = document.createElement("a");
    link.setAttribute("href", annotation.url);
    link.textContent = "[URL]";
    block.appendChild(link);

    return block;
}

export function serialize(book) {
    const doc = document.implementation.createHTMLDocument();

    doc.body.appendChild(makeHeading(book.title, null, 1));
    for (const heading of serializeToc(book.toc, 2)) {
        doc.body.appendChild(heading);
    }

    doc.body.appendChild(makeHeading("Annotations", null, 1));
    for (const block of book.annotations.map(serializeAnnotation)) {
        doc.body.appendChild(block);
    }

    const content = html_beautify(new XMLSerializer().serializeToString(doc), {
        type: "html",
    });

    return {
        content,
        language: "html",
        extension: "html",
    };
}
