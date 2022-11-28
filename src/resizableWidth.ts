import "./resizableWidth.css";

interface Direction {
    name: string;
    deltaX: number;
}

const directions: Direction[] = [
    { name: "left", deltaX: -1 },
    { name: "right", deltaX: 1 },
];

interface Drag {
    direction: Direction;
    startX: number;
    startWidth: number;
}

export interface ResizableWidthParams {
    initial: number;
    min?: number;
    onResizeFinished?: (width: number) => void;
}

export function resizableWidth(
    element: HTMLElement,
    params: ResizableWidthParams
) {
    element.style.width = `${params.initial}px`;

    const handles = [];
    const handleDirections = new WeakMap<object, Direction>();

    for (const direction of directions) {
        const handle = document.createElement("div");
        handle.setAttribute("class", "resizeHandle " + direction.name);

        handles.push(handle);
        handleDirections.set(handle, direction);

        element.appendChild(handle);
        handle.addEventListener("mousedown", onMouseDown);
    }

    let drag: Drag = null;

    function onMouseDown(event: MouseEvent) {
        const handle = event.target as HTMLElement;
        const direction = handleDirections.get(handle);

        drag = {
            direction,
            startX: event.pageX,
            startWidth: element.clientWidth,
        };
    }

    function onMouseUp() {
        if (params.onResizeFinished) {
            params.onResizeFinished(element.clientWidth);
        }
        drag = null;
    }

    function onMouseMove(event: MouseEvent) {
        if (!drag) return;

        const delta = (event.pageX - drag.startX) * drag.direction.deltaX * 2;
        let newWidth = drag.startWidth + delta;
        if (params.min) {
            newWidth = Math.max(newWidth, params.min);
        }

        element.style.width = `${newWidth}px`;
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return {
        destroy() {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);

            for (const handle of handles) {
                element.removeChild(handle);
            }
        },
    };
}
