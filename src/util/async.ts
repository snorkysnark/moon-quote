export async function asyncFilter<T>(
    array: T[],
    predicate: (value: T) => Promise<boolean>
) {
    const results = await Promise.all(array.map(predicate));
    return array.filter((_value, index) => results[index]);
}
