interface SideTarget {
    type: 'side';
    side: 'top' | 'bottom';
}

interface LinkTarget {
    type: 'link';
    link: string;
}

type ScrollTarget = SideTarget | LinkTarget;
export default ScrollTarget;
