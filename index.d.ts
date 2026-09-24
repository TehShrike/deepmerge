/**
 * object skin copy
 * e.g: SkinMerge<{ a: 1, c: 1 }, { a: 2, b: 2 }> ==> { a: 2, b: 2, c: 1 }
 */
type SkinMerge<O1, O2> = {
    [k in (keyof O1 | keyof O2)]: k extends keyof O2 ? O2[k] : (k extends keyof O1 ? O1[k] : never)
}

/**
 * get keys from O where the value is object
 * e.g: ObjKeys<{ a: {}, b: {}, c: '1' }> ==> 'a' | 'b'
 */
type ObjKeys<O> = ({
    [k in keyof O]: O[k] extends object ? k : never;
})[keyof O];

/**
 * contrary to ObjKeys, e.g: NotObjKeys<{ a: {}, b: {}, c: '1' }> ==> 'c'
 */
type NotObjKeys<O> = Exclude<keyof O, ObjKeys<O>>;

/**
 * use NotObjKeys<O> to contruct object type from 'O'
 * e.g: PickNotObj<{ a: 'a', b: 'b', c: {} }> ==> { a: 'a', b: 'b' }
 */
type PickNotObj<O> = Pick<O, NotObjKeys<O>>;

/**
 * Merge Deep Recursively For O1 O2
 * github gist about MergeDeep: https://gist.github.com/eczn/f037be1fa3650304c5c4b80c3b9e18a7
 */
type MergeDeep<O1, O2> = SkinMerge<PickNotObj<O1>, PickNotObj<O2>> & {
    // k1 is not in ObjKeys<O2>
    [k1 in Exclude<ObjKeys<O1>, ObjKeys<O2>>]: O1[k1]
} & {
    // k2 is ObjKeys<O2>, maybe some ObjKeys<k1> alson in there, so we should find it out
    [k2 in ObjKeys<O2>]: k2 extends ObjKeys<O1> ? MergeDeep<O1[k2], O2[k2]> : O2[k2]
}

/**
 * ## JS Object Deep Merge
 * look more info in https://github.com/TehShrike/deepmerge
 * @param x the first obj
 * @param y the second obj
 * @param options deepmerge option
 */
declare function deepmerge<T1 extends object, T2 extends object>(x: T1, y: T2, options?: deepmerge.Options): MergeDeep<T1, T2>

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

	export function all (objects: object[], options?: Options): object;
	export function all<T> (objects: Partial<T>[], options?: Options): T;
}

export = deepmerge;
