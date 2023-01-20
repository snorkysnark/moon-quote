interface SideTarget {
    type: "side";
    side: "top" | "bottom";
}

interface LinkTarget {
    type: "link";
    link: string;
}

interface RangeTarget {
    type: "range";
    cfi: string;
}

type ScrollTarget = SideTarget | LinkTarget | RangeTarget;
export default ScrollTarget;
