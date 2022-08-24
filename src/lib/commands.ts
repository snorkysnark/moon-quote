import { invoke } from "@tauri-apps/api/tauri";

export function libraryDir(): Promise<string> {
    return invoke("library_dir");
}

export function pathExists(path: string): Promise<boolean> {
    return invoke("path_exists", { path: path });
}

export function isDir(path: string): Promise<boolean> {
    return invoke("is_dir", { path: path });
}

export function dbExecute(sql: string, params?: any[]): Promise<number> {
    return invoke("db_execute", { sql: sql, params: params || [] });
}

export function dbQuery(sql: string, params?: any[]): Promise<object> {
    return invoke("db_query", { sql: sql, params: params || [] });
}
