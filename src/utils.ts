import * as path from "@tauri-apps/api/path";

export async function asyncFilter<T>(
    array: T[],
    predicate: (value: T) => Promise<boolean>
) {
    const results = await Promise.all(array.map(predicate));
    return array.filter((_value, index) => results[index]);
}

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
