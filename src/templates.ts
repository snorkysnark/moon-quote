import { invoke } from "@tauri-apps/api";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import type { Result } from "./result";
import { XSLTransformer } from "./structure/xml";

export type TemplatesRaw = { [name: string]: string };
export type TemplatesLoaded = { [name: string]: Result<XSLTransformer, Error> };

async function getTemplatesRaw(): Promise<TemplatesRaw> {
    return invoke("plugin:xslt_templates|get_templates");
}

function intoLoaded(templates: TemplatesRaw): TemplatesLoaded {
    const map = templates as object;
    for (const [name, source] of Object.entries(templates)) {
        try {
            map[name] = {
                status: "ok",
                value: new XSLTransformer(source),
            };
        } catch (error) {
            map[name] = {
                status: "error",
                error,
            };
        }
    }
    return map as TemplatesLoaded;
}

export async function loadTemplates(): Promise<TemplatesLoaded> {
    return intoLoaded(await getTemplatesRaw());
}

export interface UpdateMessageRaw {
    deleted: string[];
    updated: TemplatesRaw;
}

export interface UpdateMessage {
    deleted: string[];
    updated: TemplatesLoaded;
}

export async function onTemplatesReload(
    callback: (message: UpdateMessage) => void
): Promise<UnlistenFn> {
    return listen<UpdateMessageRaw>("templates_reload", (event) => {
        const message = {
            deleted: event.payload.deleted,
            updated: intoLoaded(event.payload.updated),
        };
        callback(message);
    });
}
