export function serialize(book) {
    return {
        content: JSON.stringify(book, null, 4),
        language: "json",
        extension: "json",
    };
}
