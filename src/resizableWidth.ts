import { Accessor, createEffect, onCleanup } from "solid-js";
import "./resizableWidth.css";

interface Direction {
    name: string;
    deltaX: number;
}

interface Drag {
    direction: Direction;
    startX: number;
    startWidth: number;
}

export interface ResizableWidthParams {
    initial: number;
    side?: "left" | "right";
    min?: number;
    onResizeStart?: () => void;
    onResize?: () => void;
    onResizeEnd?: () => void;
}

export function resizableWidth(
    element: HTMLElement,
    params: Accessor<ResizableWidthParams>
) {
    element.style.width = `${params().initial}px`;

    const handles: HTMLElement[] = [];
    let handleDirections: WeakMap<object, Direction>;

    function clearHandles() {
        for (const handle of handles) {
            element.removeChild(handle);
        }
        handles.length = 0;
    }

    createEffect(() => {
        clearHandles();
        handleDirections = new WeakMap<object, Direction>();

        const directions = [];
        if (params().side !== "right") {
            directions.push({ name: "left", deltaX: -1 });
        }
        if (params().side !== "left") {
            directions.push({ name: "right", deltaX: 1 });
        }

        for (const direction of directions) {
            const handle = document.createElement("div");
            handle.setAttribute("class", "resizeHandle " + direction.name);

            handles.push(handle);
            handleDirections.set(handle, direction);

            element.appendChild(handle);
            handle.addEventListener("mousedown", onMouseDown);
        }
    });

    let drag: Drag = null;

    function onMouseDown(event: MouseEvent) {
        const handle = event.target as HTMLElement;
        const direction = handleDirections.get(handle);

        drag = {
            direction,
            startX: event.pageX,
            startWidth: element.clientWidth,
        };

        params().onResizeStart?.();
    }

    function onMouseUp() {
        params().onResizeEnd?.();
        drag = null;
    }

    function onMouseMove(event: MouseEvent) {
        if (!drag) return;

        let delta = (event.pageX - drag.startX) * drag.direction.deltaX;
        if (!params().side) delta *= 2;

        let newWidth = drag.startWidth + delta;
        if (params().min) {
            newWidth = Math.max(newWidth, params().min);
        }

        element.style.width = `${newWidth}px`;
        params().onResize?.();
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    onCleanup(() => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);

        clearHandles();
    });
}

declare module "solid-js" {
    namespace JSX {
        interface Directives {
            resizableWidth: ResizableWidthParams;
        }
    }
}
