import { createStore, produce } from "solid-js/store";

export interface Mark {
    range: Range;
    clientRects: DOMRect[];
}

export interface MarkControls {
    addMark: (range: Range) => void;
    updateRects: () => void;
}

function computeClientRects(range: Range): DOMRect[] {
    return Array.from(range.getClientRects());
}

export function createMarks(): [{ array: Mark[] }, MarkControls] {
    const [marks, setMarks] = createStore({ array: [] as Mark[] });

    function addMark(range: Range) {
        setMarks(
            produce((marks) =>
                marks.array.push({
                    range,
                    clientRects: computeClientRects(range),
                })
            )
        );
    }

    function updateRects() {
        setMarks(
            produce((marks) => {
                for (const mark of marks.array) {
                    mark.clientRects = computeClientRects(mark.range);
                }
            })
        );
    }

    return [marks, { addMark, updateRects }];
}
