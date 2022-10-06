import { invoke } from "@tauri-apps/api";
import type { Result } from "./result";
import { XSLTransformer } from "./structure/xml";

export interface Template {
    name: string;
    source: string;
}

export interface TemplateLoaded {
    name: string;
    transformer: Result<XSLTransformer, Error>;
}

export interface TemplatesReload {
    deleted: string[];
    updated: Template;
}

async function getTemplatesRaw(): Promise<Template[]> {
    return invoke("plugin:xslt_templates|get_templates");
}

export async function loadTemplates(): Promise<TemplateLoaded[]> {
    return (await getTemplatesRaw()).map((template) => {
        let transformer: Result<XSLTransformer, Error>;
        try {
            transformer = {
                status: "ok",
                value: new XSLTransformer(template.source),
            };
        } catch (error) {
            transformer = {
                status: "error",
                error,
            };
        }

        return {
            name: template.name,
            transformer,
        };
    });
}
