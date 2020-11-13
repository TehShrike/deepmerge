import type { Options } from "./options"

/**
 * Deep merge 1 or more types given in an array.
 */
export type DeepMergeAll<
	Ts extends readonly [any, ...any[]],
	O extends Options
> = Ts extends readonly [infer T1, ...any[]]
	? Ts extends readonly [T1, infer T2, ...infer TRest]
		? TRest extends readonly never[]
			? DeepMerge<T1, T2, O>
			: DeepMerge<T1, DeepMergeAll<[T2, ...TRest], O>, O>
		: T1
	: never

/**
 * Deep merge 2 types.
 */
export type DeepMerge<T1, T2, O extends Options> = IsSame<T1, T2> extends true
	? T1 | T2
	: And<IsObjectOrArray<T1>, IsObjectOrArray<T2>> extends true
	? DeepMergeValues<T1, T2, O>
	: Leaf<T1, T2>

/**
 * Deep merge 2 objects (they may be arrays).
 */
type DeepMergeValues<T1, T2, O extends Options> = And<IsArray<T1>, IsArray<T2>> extends true
	? DeepMergeArrays<T1, T2, O>
	: And<IsObject<T1>, IsObject<T2>> extends true
	? DeepMergeObjects<T1, T2, O>
	: Leaf<T1, T2>

/**
 * Deep merge 2 non-array objects.
 */
export type DeepMergeObjects<T1, T2, O extends Options> = FlatternAlias<
	// @see https://github.com/microsoft/TypeScript/issues/41448
	{
		-readonly [K in keyof T1]: DeepMergeObjectProps<ValueOfKey<T1, K>, ValueOfKey<T2, K>, O>
	} &
		{
			-readonly [K in keyof T2]: DeepMergeObjectProps<ValueOfKey<T1, K>, ValueOfKey<T2, K>, O>
		}
>

/**
 * Deep merge 2 types that are known to be properties of an object being deeply
 * merged.
 */
type DeepMergeObjectProps<T1, T2, O extends Options> = Or<
	IsUndefinedOrNever<T1>,
	IsUndefinedOrNever<T2>
> extends true
	? Leaf<T1, T2>
	: IsUndefinedOrNever<O["isMergeable"]> extends true
	? IsUndefinedOrNever<O["customMerge"]> extends true
		? DeepMerge<T1, T2, O>
		: DeepMergeObjectPropsCustom<T1, T2, O>
	: MaybeLeaf<T1, T2>

/**
 * Deep merge 2 types that are known to be properties of an object being deeply
 * merged and where a "customMerge" function has been provided.
 */
type DeepMergeObjectPropsCustom<T1, T2, O extends Options> = ReturnType<
	NonNullable<O["customMerge"]>
> extends undefined
	? DeepMerge<T1, T2, O>
	: undefined extends ReturnType<NonNullable<O["customMerge"]>>
	? Or<IsArray<T1>, IsArray<T2>> extends true
		? And<IsArray<T1>, IsArray<T2>> extends true
			? DeepMergeArrays<T1, T2, O>
			: Leaf<T1, T2>
		: DeepMerge<T1, T2, O> | ReturnType<NonNullable<ReturnType<NonNullable<O["customMerge"]>>>>
	: ReturnType<NonNullable<ReturnType<NonNullable<O["customMerge"]>>>>

/**
 * Deep merge 2 arrays.
 *
 * Cannot get return type from arrayMerge passing generics.
 * TypeScript does not yet support higher order types.
 * @see https://github.com/Microsoft/TypeScript/issues/1213
 */
type DeepMergeArrays<T1, T2, O extends Options> = IsUndefinedOrNever<O["arrayMerge"]> extends true
	? T1 extends readonly [...infer E1]
		? T2 extends readonly [...infer E2]
			? [...E1, ...E2]
			: never
		: never
	: ReturnType<NonNullable<O["arrayMerge"]>>

/**
 * Get the leaf type from 2 types that can't be merged.
 */
type Leaf<T1, T2> = IsNever<T2> extends true
	? T1
	: IsNever<T1> extends true
	? T2
	: IsUndefinedOrNever<T2> extends true
	? T1
	: T2

/**
 * Get the leaf type from 2 types that might not be able to be merged.
 */
type MaybeLeaf<T1, T2> = Or<
	Or<IsUndefinedOrNever<T1>, IsUndefinedOrNever<T2>>,
	Not<And<IsObjectOrArray<T1>, IsObjectOrArray<T2>>>
> extends true
	? Leaf<T1, T2>
	: // TODO: Handle case where return type of "isMergeable" is a typeguard. If it is we can do better than just "unknown".
	  unknown

/**
 * Flatten a complex type such as a union or intersection of objects into a
 * single object.
 */
type FlatternAlias<T> = {} & { [P in keyof T]: T[P] }

/**
 * Get the value of the given key in the given object.
 */
type ValueOfKey<T, K> = K extends keyof T ? T[K] : never

/**
 * Safely test whether or not the first given types extends the second.
 *
 * Needed in particular for testing if a type is "never".
 */
type Is<T1, T2> = [T1] extends [T2] ? true : false

/**
 * Safely test whether or not the given type is "never".
 */
type IsNever<T> = Is<T, never>

/**
 * Is the given type undefined or never?
 */
type IsUndefinedOrNever<T> = Is<T, undefined>

/**
 * Returns whether or not the give two types are the same.
 */
type IsSame<T1, T2> = Is<T1, T2> extends true ? Is<T2, T1> : false

/**
 * Returns whether or not the given type an object (arrays are objects).
 */
type IsObjectOrArray<T> = And<Not<IsNever<T>>, T extends object ? true : false>

/**
 * Returns whether or not the given type a non-array object.
 */
type IsObject<T> = And<IsObjectOrArray<T>, Not<IsArray<T>>>

/**
 * Returns whether or not the given type an array.
 */
type IsArray<T> = And<Not<IsNever<T>>, T extends ReadonlyArray<any> ? true : false>

/**
 * And operator for types.
 */
type And<T1 extends boolean, T2 extends boolean> = T1 extends false ? false : T2

/**
 * Or operator for types.
 */
type Or<T1 extends boolean, T2 extends boolean> = T1 extends true ? true : T2

/**
 * Not operator for types.
 */
type Not<T extends boolean> = T extends true ? false : true

/**
 * A property that can index an object.
 */
export type Property = string | number | symbol
