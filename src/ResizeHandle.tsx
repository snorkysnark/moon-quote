import { onCleanup, Setter } from "solid-js";

interface Drag {
    startX: number;
    startWidth: number;
}

export default function ResizeHandle(props: {
    width: number;
    setWidth: Setter<number>;
    deltaX: number;
    min?: number;
    class?: string;
    onResizeStart?: () => void;
    onResize?: () => void;
    onResizeEnd?: () => void;
}) {
    let drag: Drag = null;

    function onMouseDown(event: MouseEvent) {
        drag = { startX: event.pageX, startWidth: props.width };
        props.onResizeStart?.();
    }
    function onMouseUp() {
        props.onResizeEnd?.();
        drag = null;
    }
    function onMouseMove(event: MouseEvent) {
        if (!drag) return;

        const delta = (event.pageX - drag.startX) * props.deltaX;
        let newWidth = drag.startWidth + delta;
        if (props.min) {
            newWidth = Math.max(newWidth, props.min);
        }

        props.setWidth(newWidth);
        props.onResize?.();
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    onCleanup(() => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
    });

    return <div class={props.class} onMouseDown={onMouseDown}></div>;
}
