declare function deepmerge<T1, T2>(x: T1, y: T2, options?: deepmerge.Options): T1 & T2;

declare namespace deepmerge {
	export interface Options {
		arrayMerge?(target: any[], source: any[], options?: ArrayMergeOptions): any[];
		clone?: boolean;
		customMerge?: (key: string, options?: Options) => ((x: any, y: any) => any) | undefined;
		isMergeableObject?(value: object): boolean;
	}
	export interface ArrayMergeOptions {
		isMergeableObject(value: object): boolean;
		cloneUnlessOtherwiseSpecified(value: object, options?: Options): object;
	}

	export function all<T1, T2> (objects: [T1, T2], options?: Options): T1 & T2;
	export function all<T1, T2, T3> (objects: [T1, T2, T3], options?: Options): T1 & T2 & T3;
	export function all<T1, T2, T3, T4> (objects: [T1, T2, T3, T4], options?: Options): T1 & T2 & T3 & T4;
	export function all<T1, T2, T3, T4, T5> (objects: [T1, T2, T3, T4, T5], options?: Options): T1 & T2 & T3 & T4 & T5;
	export function all<T> (objects: T[], options?: Options): T;
}

export = deepmerge;
