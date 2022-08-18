import { invoke } from "@tauri-apps/api/tauri";

function appDataDir(): Promise<string> {
    return invoke("app_data_dir");
}

function pathExists(path: string): Promise<boolean> {
    return invoke("path_exists", { path: path });
}

export { appDataDir, pathExists };
