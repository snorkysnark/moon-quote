interface SideTarget {
    type: 'side';
    side: 'top' | 'bottom';
}

type ScrollTarget = SideTarget;
export default ScrollTarget;
