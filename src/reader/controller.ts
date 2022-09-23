export interface RenditionController {
    next: () => Promise<void>;
    prev: () => Promise<void>;
    nextPage: () => Promise<void>;
    prevPage: () => Promise<void>;
    display: (target: string | number) => Promise<void>;
    scrollUp: () => void;
    scrollDown: () => void;
    startOfChapter: () => Promise<void>;
    endOfChapter: () => Promise<void>;
}
