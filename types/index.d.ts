type ValueOfKey<T, K> = K extends keyof T ? T[K] : never;
// Is object AND NOT ('never' or 'array')
type IsObject<T> = [T] extends [never] ? false : T extends unknown[] ? false : [T] extends [object] ? true : false;
type ShouldMergeProps<T1, T2> = IsObject<T1> extends false ? false : IsObject<T2> extends false ? false : true;
type DeepMerge<T1, T2> = ShouldMergeProps<T1, T2> extends true
    ? {
          [K in keyof T1 | keyof T2]: DeepMerge<ValueOfKey<T1, K>, ValueOfKey<T2, K>>;
      }
    : T1 | T2;

/**
* ## JS Object Deep Merge
* look more info in https://github.com/TehShrike/deepmerge
* @param x the first obj
* @param y the second obj
* @param options deepmerge option
*/
declare function deepmerge<T1 extends object, T2 extends object>(x: T1, y: T2, options?: deepmerge.Options): DeepMerge<T1, T2>

declare namespace deepmerge {
	export interface Options {
		arrayMerge?(target: any[], source: any[], options?: Options): any[];
		clone?: boolean;
		customMerge?: (key: string, options?: Options) => ((x: any, y: any) => any) | undefined;
		isMergeableObject?(value: object): boolean;
	}

	export function all (objects: object[], options?: Options): object;
	export function all<T> (objects: Partial<T>[], options?: Options): T;
}

export = deepmerge;
