import { onMount } from "svelte";

export function createManualPromise(): [Promise<void>, () => {}] {
    let manualResolve = undefined;
    const promise = new Promise<void>((resolve) => {
        manualResolve = resolve;
    });

    return [promise, manualResolve];
}

export function asyncOnMount(): Promise<void> {
    const [mounted, setMounted] = createManualPromise();
    onMount(() => setMounted());

    return mounted;
}
