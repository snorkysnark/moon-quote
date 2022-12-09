import { Contents } from "epubjs";
import Section from "epubjs/types/section";
import { createBlobUrl, revokeBlobUrl } from "epubjs/src/utils/core";
import {
    createEffect,
    createMemo,
    createResource,
    createSignal,
    on,
    onCleanup,
    Show,
} from "solid-js";
import { EVENTS } from "epubjs/src/utils/constants";

export default function EpubView(props: {
    request: (path: string) => Promise<any>;
    section: Section;
    onKeyDown?: (event: KeyboardEvent) => void;
}) {
    const [html] = createResource(
        () => ({ request: props.request, section: props.section }),
        ({ section, request }) => {
            return section.render(request);
        }
    );
    const blobUrl = createMemo(() => {
        if (html()) {
            const url = createBlobUrl(html(), "application/xhtml+xml");
            onCleanup(() => {
                revokeBlobUrl(url);
            });
            return url;
        }
    });

    // Not cleaning up contents/textHeight when section changes,
    // so that iframe doesn't flicker while loading new content
    const [contents, setContents] = createSignal<Contents>(null);
    const [textHeight, setTextHeight] = createSignal<number>(null);
    createEffect(
        on(contents, () => {
            if (contents()) {
                const lastContents = contents();
                const onResize = () => {
                    setTextHeight(lastContents.textHeight());
                };
                lastContents.on(EVENTS.CONTENTS.RESIZE, onResize);

                onCleanup(() => {
                    lastContents.off(EVENTS.CONTENTS.RESIZE, onResize);
                    lastContents.destroy();
                });
            }
        })
    );

    let scroller: HTMLDivElement;
    let iframe: HTMLIFrameElement;
    const onLoadIframe = () => {
        const iframeDoc = iframe.contentDocument;
        iframeDoc.body.style.overflow = "hidden";

        if (props.onKeyDown) {
            iframe.contentWindow.addEventListener("keydown", props.onKeyDown);
        }

        setContents(
            new Contents(
                iframeDoc,
                iframeDoc.body,
                props.section.cfiBase,
                props.section.index
            )
        );
    };

    return (
        <div class="w-full h-full overflow-scroll relative" ref={scroller}>
            <Show when={blobUrl()}>
                <iframe
                    class="w-full overflow-hidden"
                    src={blobUrl()}
                    onLoad={onLoadIframe}
                    ref={iframe}
                    style={{
                        height: textHeight()
                            ? `max(${textHeight()}px, 100%)`
                            : "100%",
                    }}
                ></iframe>
            </Show>
        </div>
    );
}
