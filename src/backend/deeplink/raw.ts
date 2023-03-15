import { invoke } from "@tauri-apps/api";
import { AnnotationEntry, BookEntry } from "../library";

// Tauri event
// Subscribe using listen<DeeplinkTarget>(GOTO_TARGET)
export const GOTO_TARGET = "goto_target";

// Target can be supplied through the GOTO_TARGET event or
// (if existed before the webrenderer was initialised) through getInitialTarget() command
export interface DeeplinkTarget {
    book: BookEntry;
    location: DeeplinkTargetLocation;
}

export type DeeplinkTargetLocation =
    | {
          type: "Annotation";
          value: AnnotationEntry;
      }
    | {
          type: "Range";
          value: string;
      }
    | {
          type: "Chapter";
          value: string;
      };

export function getInitialTarget(): Promise<DeeplinkTarget> {
    return invoke("plugin:deeplink|initial_target");
}
