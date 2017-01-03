declare namespace deepmerge {
    interface DeepmergeSignature {
        <T>(x: T, y: T, options?: DeepmergeOptions<T>): T;
        all: <T>(objects: T[], options?: DeepmergeOptions<T>) => T;
    }

    interface DeepmergeOptions<T> {
        clone?: boolean;
        arrayMerge?: (destination: T, source: T, options?: DeepmergeOptions<T>) => T;
    }
}

declare let deepmerge: deepmerge.DeepmergeSignature;

declare module 'deepmerge' {
    export = deepmerge;
}
