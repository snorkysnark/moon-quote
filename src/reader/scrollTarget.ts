interface SideTarget {
    type: 'side';
    side: 'top' | 'bottom';
}

interface LinkTarget {
    type: 'link';
    link: string;
}

interface AnchorTarget {
    type: 'anchor';
    node: HTMLElement;
    offset: number;
}

type ScrollTarget = SideTarget | LinkTarget | AnchorTarget;
export default ScrollTarget;
