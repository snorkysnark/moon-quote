export function makeAnnotationURL(bookId: string, cfi: string) {
    return `moonquote:///book/${encodeURIComponent(
        bookId
    )}/annotation/${encodeURIComponent(cfi)}`;
}
