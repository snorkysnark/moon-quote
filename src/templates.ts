import { invoke } from "@tauri-apps/api";
import type { Result } from "./result";
import { XSLTransformer } from "./structure/xml";

async function getTemplatesRaw(): Promise<{ [name: string]: string }> {
    return invoke("plugin:xslt_templates|get_templates");
}

export async function loadTemplates(): Promise<{
    [name: string]: Result<XSLTransformer, any>;
}> {
    const loaded = {};

    for (const [name, source] of Object.entries(await getTemplatesRaw())) {
        try {
            loaded[name] = {
                status: "ok",
                value: new XSLTransformer(source),
            };
        } catch (error) {
            loaded[name] = {
                status: "error",
                error,
            };
        }
    }

    return loaded;
}
