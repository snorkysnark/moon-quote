import { invoke } from "@tauri-apps/api";
import { AnnotationFull } from "./library";

export function finishSearch(value: AnnotationFull): Promise<void> {
    return invoke("plugin:local_server|finish_search", { value });
}
