import { invoke } from "@tauri-apps/api";

export async function openFolder(path: string): Promise<void> {
    return invoke("open_folder", { path });
}

export async function openExportersFolder(): Promise<void> {
    return invoke("open_exporters_folder");
}
