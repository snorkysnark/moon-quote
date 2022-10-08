import { invoke } from "@tauri-apps/api";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import type { Result } from "./result";
import type { BookExportData } from "./structure/json";

export interface ExporterOutput {
    content: string;
    language?: string;
    extension?: string;
}

export interface Exporter {
    serialize: (book: BookExportData) => ExporterOutput;
}

type ExportersRaw = { [name: string]: string };
export type ExportersLoaded = { [name: string]: Result<Exporter, Error> };

function getExportersRaw(): Promise<ExportersRaw> {
    return invoke("plugin:exporters|get_exporters");
}

async function loadExporters(sources: ExportersRaw): Promise<ExportersLoaded> {
    const exporters = sources as object;
    for (const [name, source] of Object.entries(exporters)) {
        try {
            exporters[name] = {
                status: "ok",
                value: await import(/* @vite-ignore */ source),
            };
        } catch (error) {
            exporters[name] = {
                status: "error",
                error,
            };
        }
    }
    return exporters as ExportersLoaded;
}

export async function getExportersLoaded(): Promise<ExportersLoaded> {
    return await loadExporters(await getExportersRaw());
}

export interface UpdateMessageRaw {
    deleted: string[];
    updated: ExportersRaw;
}

export interface UpdateMessage {
    deleted: string[];
    updated: ExportersLoaded;
}

export async function onExportersReload(
    callback: (message: UpdateMessage) => void
): Promise<UnlistenFn> {
    return listen<UpdateMessageRaw>("update_exporters", async (event) => {
        const message = {
            deleted: event.payload.deleted,
            updated: await loadExporters(event.payload.updated),
        };
        callback(message);
    });
}
