import { invoke } from "@tauri-apps/api/tauri";
import type { PackagingMetadataObject } from "epubjs/types/packaging";

export function dbExecute(sql: string, params?: object): Promise<number> {
    params = params || [];

    if (Array.isArray(params)) {
        return invoke("db_execute", { sql, params });
    } else {
        return invoke("db_execute_named", { sql, params });
    }
}

export function dbQuery(sql: string, params?: object): Promise<object> {
    params = params || [];

    if (Array.isArray(params)) {
        return invoke("db_query", { sql, params });
    } else {
        return invoke("db_query_named", { sql, params });
    }
}

export function uploadBook(
    bookPath: string,
    metadata: PackagingMetadataObject,
    coverUrl: string,
    coverData: Uint8Array
) {
    invoke("upload_book", {
        bookPath,
        metadata,
        coverUrl,
        coverData: Array.from(coverData),
    });
}
