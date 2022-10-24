import * as path from "@tauri-apps/api/path";
import { asyncFilter } from "./async";

export async function extnameSafe(filePath: string): Promise<string | null> {
    try {
        return await path.extname(filePath);
    } catch {
        return null;
    }
}

export function filterByExtension(
    filePaths: string[],
    allowedExtensions: string[]
): Promise<string[]> {
    return asyncFilter(filePaths, async (filePath) =>
        allowedExtensions.includes(await extnameSafe(filePath))
    );
}
