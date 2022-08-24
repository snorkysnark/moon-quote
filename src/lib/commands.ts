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

export function dbExecute(
    sql: string,
    params?: object
): Promise<number> {
    params = params || [];

    if (Array.isArray(params)) {
        return invoke("db_execute", { sql: sql, params: params });
    } else {
        return invoke("db_execute_named", { sql: sql, params: params });
    }
}

export function dbQuery(sql: string, params?: object): Promise<object> {
    params = params || [];

    if (Array.isArray(params)) {
        return invoke("db_query", { sql: sql, params: params });
    } else {
        return invoke("db_query_named", { sql: sql, params: params });
    }
}
