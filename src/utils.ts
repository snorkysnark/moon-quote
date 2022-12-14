import * as path from "@tauri-apps/api/path";
import { Contents, EpubCFI } from "epubjs";
import type { AnnotationDatabaseEntry } from "./backend";

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

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

export function clickOutside(node: HTMLElement) {
    const handleClick = (event: MouseEvent) => {
        if (!node.contains(event.target as Node)) {
            node.dispatchEvent(new CustomEvent("clickOutside"));
        }
    };

    document.addEventListener("click", handleClick, true);

    return {
        destroy() {
            document.removeEventListener("click", handleClick, true);
        },
    };
}

// No idea why EpubCFI.compare isn't a static method
export const compareCfi = new EpubCFI().compare;

export function sortAnnotations(annotations: AnnotationDatabaseEntry[]) {
    annotations.sort((a, b) => compareCfi(a.cfi, b.cfi));
    return annotations;
}

export function cfiToRangeSafe(contents: Contents, cfi: string) {
    if (cfi.startsWith(`epubcfi(${contents.cfiBase}!`)) {
        return new EpubCFI(cfi).toRange(contents.document);
    }
    return null;
}
