import { invoke } from "@tauri-apps/api";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
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
export type ExportersLoaded = { [name: string]: Promise<Exporter> };

function getExportersRaw(): Promise<ExportersRaw> {
    return invoke("plugin:exporters|get_exporters");
}

function loadExporters(sources: ExportersRaw): ExportersLoaded {
    const exporters = sources as object;
    for (const [name, source] of Object.entries(exporters)) {
        exporters[name] = import(/* @vite-ignore */ source);
    }
    return exporters as ExportersLoaded;
}

export async function getExportersLoaded(): Promise<ExportersLoaded> {
    return loadExporters(await getExportersRaw());
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
            updated: loadExporters(event.payload.updated),
        };
        callback(message);
    });
}

export function verifyOutput(output: any): ExporterOutput {
    if (typeof output !== "object" || output.content === undefined) {
        throw new Error(`Expected object {
    content: string;
    language?: string;
    extension?: string;
}, got ${output}`);
    }
    return output as ExporterOutput;
}
