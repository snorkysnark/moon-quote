export interface Ok<T> {
    status: "ok";
    value: T;
}

export interface Err<E> {
    status: "error";
    error: E;
}

export type Result<T, E> = Ok<T> | Err<E>;
