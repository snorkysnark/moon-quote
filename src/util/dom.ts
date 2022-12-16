export function findNodeBelow(root: HTMLElement, position: number) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);

    let highestNode: HTMLElement = null;
    let highestPosition: number;

    while (walker.nextNode()) {
        const node = walker.currentNode as HTMLElement;
        const bottom = node.getBoundingClientRect().bottom;

        if (bottom > position && (!highestNode || bottom < highestPosition)) {
            highestNode = node;
            highestPosition = bottom;
        }
    }

    return highestNode;
}
