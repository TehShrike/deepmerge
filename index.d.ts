declare function deepmerge<T1, T2>(x: T1, y: T2, options?: deepmerge.Options): T1 & T2;

declare namespace deepmerge {
	export interface Options {
		arrayMerge?(target: any[], source: any[], options?: Options): any[];
		clone?: boolean;
		customMerge?: (key: string, options?: Options) => ((x: any, y: any) => any) | undefined;
		isMergeableObject?(value: object): boolean;
	}

	export function all (objects: object[], options?: Options): object;
	export function all<T> (objects: T[], options?: Options): T;
}

export = deepmerge;
