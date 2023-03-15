import { invoke } from "@tauri-apps/api";

export function openFolder(path: string): Promise<void> {
    return invoke("open_folder", { path });
}
