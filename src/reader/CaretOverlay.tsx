export default function CaretOverlay(props: { caretRect: DOMRect }) {
    return (
        <div
            class="absolute"
            style={{
                left: `${props.caretRect.x - 1}px`,
                top: `${props.caretRect.y}px`,
            }}
        >
            <svg width="2" height={props.caretRect.height}>
                <rect
                    width="2"
                    height={props.caretRect.height}
                    style="fill:red"
                />
            </svg>
        </div>
    );
}
