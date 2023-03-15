import { EpubCFI } from "epubjs";
import { EpubCFIStep } from "epubjs/types/epubcfi";
import type { AnnotationEntry } from "src/backend/library";

export function sortAnnotations(annotations: AnnotationEntry[]) {
    annotations.sort((a, b) => compareCfi(a.cfi, b.cfi));
    return annotations;
}

/**
 * Fixed comparison algorithm from epubjs: uses base.steps[1] instead of spinePos
 * Compare which of two CFIs is earlier in the text
 * @returns {number} First is earlier = -1, Second is earlier = 1, They are equal = 0
 */
export function compareCfi(cfiOne: EpubCFI, cfiTwo: EpubCFI): number {
    let stepsA: EpubCFIStep[];
    let stepsB: EpubCFIStep[];
    let terminalA: { offset: number; assertion: string };
    let terminalB: { offset: number; assertion: string };

    // Compare Spine Positions
    if (cfiOne.base.steps[1].index > cfiTwo.base.steps[1].index) {
        return 1;
    }
    if (cfiOne.base.steps[1].index < cfiTwo.base.steps[1].index) {
        return -1;
    }

    if (cfiOne.range) {
        stepsA = cfiOne.path.steps.concat(cfiOne.start.steps);
        terminalA = cfiOne.start.terminal;
    } else {
        stepsA = cfiOne.path.steps;
        terminalA = cfiOne.path.terminal;
    }

    if (cfiTwo.range) {
        stepsB = cfiTwo.path.steps.concat(cfiTwo.start.steps);
        terminalB = cfiTwo.start.terminal;
    } else {
        stepsB = cfiTwo.path.steps;
        terminalB = cfiTwo.path.terminal;
    }

    // Compare Each Step in the First item
    for (var i = 0; i < stepsA.length; i++) {
        if (!stepsA[i]) {
            return -1;
        }
        if (!stepsB[i]) {
            return 1;
        }
        if (stepsA[i].index > stepsB[i].index) {
            return 1;
        }
        if (stepsA[i].index < stepsB[i].index) {
            return -1;
        }
        // Otherwise continue checking
    }

    // All steps in First equal to Second and First is Less Specific
    if (stepsA.length < stepsB.length) {
        return -1;
    }

    // Compare the character offset of the text node
    if (terminalA.offset > terminalB.offset) {
        return 1;
    }
    if (terminalA.offset < terminalB.offset) {
        return -1;
    }

    // CFI's are equal
    return 0;
}
