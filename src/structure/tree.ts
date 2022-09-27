export interface Tree {
    subitems?: this[];
}

export function* iterTreeFlat<T extends Tree>(tree: T): Generator<T> {
    yield tree;
    if (tree.subitems) {
        for (const subitem of tree.subitems) {
            yield* iterTreeFlat(subitem);
        }
    }
}

export function* iterTreesFlat<T extends Tree>(trees: T[]): Generator<T> {
    for (const tree of trees) {
        yield* iterTreeFlat(tree);
    }
}

export class TreeExtended<T> {
    data: T;
    subitems: TreeExtended<T>[];

    private constructor(data: T, subitems: TreeExtended<T>[]) {
        this.data = data;
        this.subitems = subitems;
    }

    static mapTree<T>(item: Tree, mapFn: (item: Tree) => T): TreeExtended<T> {
        const newData = mapFn(item);
        const newSubitems = item.subitems
            ? item.subitems.map((subitem) =>
                  TreeExtended.mapTree(subitem, mapFn)
              )
            : [];
        return new TreeExtended(newData, newSubitems);
    }

    static async mapTreeAsync<T>(
        item: Tree,
        mapFn: (item: Tree) => Promise<T>
    ): Promise<TreeExtended<T>> {
        const newData = await mapFn(item);
        const newSubitems = item.subitems
            ? item.subitems.map((subitem) =>
                  TreeExtended.mapTreeAsync(subitem, mapFn)
              )
            : [];
        return new TreeExtended(newData, await Promise.all(newSubitems));
    }

    static mapTreeAll<T>(
        items: Tree[],
        mapFn: (item: Tree) => T
    ): TreeExtended<T>[] {
        return items.map((item) => TreeExtended.mapTree(item, mapFn));
    }

    static async mapTreeAsyncAll<T>(
        items: Tree[],
        mapFn: (item: Tree) => Promise<T>
    ): Promise<TreeExtended<T>[]> {
        const promises = items.map((item) =>
            TreeExtended.mapTreeAsync(item, mapFn)
        );
        return Promise.all(promises);
    }

    map<O>(mapFn: (data: T) => O): TreeExtended<O> {
        const newData = mapFn(this.data);
        const newSubitems = this.subitems.map((subitem) => subitem.map(mapFn));
        return new TreeExtended(newData, newSubitems);
    }

    static mapAll<T, O>(
        items: TreeExtended<T>[],
        mapFn: (data: T) => O
    ): TreeExtended<O>[] {
        return items.map((item) => item.map(mapFn));
    }

    *iterRecursive(): Generator<TreeExtended<T>> {
        yield this;
        for (const subitem of this.subitems) {
            yield* subitem.iterRecursive();
        }
    }

    static *iterAllRecursive<T>(
        items: TreeExtended<T>[]
    ): Generator<TreeExtended<T>> {
        for (const item of items) {
            yield* item.iterRecursive();
        }
    }
}
