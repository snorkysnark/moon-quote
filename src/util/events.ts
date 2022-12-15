export type EventEmitter<T> = (payload: T) => void;

type EventCallback<T> = (payload: T) => void;
export interface EventListener<T> {
    listen(callback: EventCallback<T>): void;
    remove(callback: EventCallback<T>): void;
}

export function createEvent<T>(): [EventEmitter<T>, EventListener<T>] {
    let listeners = [];

    return [
        (payload: T) => {
            for (const callback of listeners) {
                callback(payload);
            }
        },
        {
            listen(callback: EventCallback<T>) {
                listeners.push(callback);
            },
            remove(callback: EventCallback<T>) {
                listeners = listeners.filter((c) => c !== callback);
            },
        },
    ];
}
