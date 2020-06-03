declare function deepmerge<T>(x: Partial<T>, y: Partial<T>, options?: deepmerge.Options): T;
declare function deepmerge<T1, T2>(x: Partial<T1>, y: Partial<T2>, options?: deepmerge.Options): T1 & T2;

declare namespace deepmerge {
	export type CustomOptions = Required<Options> & {
		cloneUnlessOtherwiseSpecified: (item: any, options: CustomOptions) => any
	}
	export interface Options {
		arrayMerge?(target: any[], source: any[], options: CustomOptions): any[];
		clone?: boolean;
		customMerge?: (key: string, options: CustomOptions) => ((x: any, y: any) => any) | undefined;
		isMergeableObject?(value: object): boolean;
	}

	export function all (objects: object[], options?: Options): object;
	export function all<T> (objects: Partial<T>[], options?: Options): T;
}

export = deepmerge;
