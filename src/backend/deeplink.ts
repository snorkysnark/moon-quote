import { listen } from "@tauri-apps/api/event";
import { DeeplinkTarget, GOTO_TARGET, getInitialTarget } from "./deeplink/raw";

export type { DeeplinkTarget, DeeplinkTargetData } from "./deeplink/raw";

// Encodes a url of type 'moonquote:///annotation/<id>',
// 'moonquote:///book/<id>/range/<cfi>' or 'moonquote:///book/<id>/nav/<href>'
export function makeTargetURL(
    description:
        | { annotation: number }
        | { bookId: string; range: string }
        | { bookId: string; chapter: string }
) {
    if ("annotation" in description) {
        return `moonquote:///annotation/${description.annotation}`;
    } else if ("range" in description) {
        return `moonquote:///book/${encodeURIComponent(
            description.bookId
        )}/range/${description.range}`;
    } else {
        return `moonquote:///book/${encodeURIComponent(
            description.bookId
        )}/nav/${description.chapter}`;
    }
}

export function onAnnotationLink(callback: (target: DeeplinkTarget) => void) {
    getInitialTarget().then((target) => callback?.(target));
    const unlisten = listen<DeeplinkTarget>(GOTO_TARGET, (event) => {
        callback?.(event.payload);
    });

    // Call this function to unsubscribe
    return async () => {
        callback = null;
        (await unlisten)();
    };
}
