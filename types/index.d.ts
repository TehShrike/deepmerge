// Minimum TypeScript Version: 4.2
// TODO: Can be reduce to version 4.1 upon it's release.

/**
 * Deep merge 1 or more types given in an array.
 */
type DeepMergeAll<
	Ts extends readonly [any, ...any[]],
	Options extends deepmerge.Options
> = Ts extends readonly [infer T1, ...any[]]
	? Ts extends readonly [T1, infer T2, ...infer TRest]
		? TRest extends readonly never[]
			? DeepMerge<T1, T2, Options>
			: DeepMerge<T1, DeepMergeAll<[T2, ...TRest], Options>, Options>
		: T1
	: never;

/**
 * Deep merge 2 types.
 */
type DeepMerge<T1, T2, Options extends deepmerge.Options> = IsSame<
	T1,
	T2
> extends true
	? T1 | T2
	: And<IsObjectOrArray<T1>, IsObjectOrArray<T2>> extends true
	? DeepMergeNonPrimitive<T1, T2, Options>
	: Leaf<T1, T2>;

/**
 * Deep merge 2 objects (they may be arrays).
 */
type DeepMergeNonPrimitive<T1, T2, Options extends deepmerge.Options> = And<
	IsArray<T1>,
	IsArray<T2>
> extends true
	? DeepMergeArrays<T1, T2, Options>
	: And<IsObject<T1>, IsObject<T2>> extends true
	? DeepMergeObjects<T1, T2, Options>
	: Leaf<T1, T2>;

/**
 * Deep merge 2 non-array objects.
 */
type DeepMergeObjects<
	T1,
	T2,
	Options extends deepmerge.Options
> = FlatternAlias<
	// @see https://github.com/microsoft/TypeScript/issues/41448
	{
		-readonly [K in keyof T1]: DeepMergeObjectProps<
			ValueOfKey<T1, K>,
			ValueOfKey<T2, K>,
			Options
		>;
	} &
		{
			-readonly [K in keyof T2]: DeepMergeObjectProps<
				ValueOfKey<T1, K>,
				ValueOfKey<T2, K>,
				Options
			>;
		}
>;

/**
 * Deep merge 2 types that are known to be properties of an object being deeply
 * merged.
 */
type DeepMergeObjectProps<T1, T2, Options extends deepmerge.Options> = Or<
	IsUndefinedOrNever<T1>,
	IsUndefinedOrNever<T2>
> extends true
	? Leaf<T1, T2>
	: GetOption<Options, "isMergeableObject"> extends undefined
	? GetOption<Options, "customMerge"> extends undefined
		? DeepMerge<T1, T2, Options>
		: DeepMergeObjectPropsCustom<T1, T2, Options>
	: MaybeLeaf<T1, T2>;

/**
 * Deep merge 2 types that are known to be properties of an object being deeply
 * merged and where a "customMerge" function has been provided.
 */
type DeepMergeObjectPropsCustom<
	T1,
	T2,
	Options extends deepmerge.Options
> = ReturnType<NonNullable<GetOption<Options, "customMerge">>> extends undefined
	? DeepMerge<T1, T2, Options>
	: undefined extends ReturnType<NonNullable<GetOption<Options, "customMerge">>>
	? Or<IsArray<T1>, IsArray<T2>> extends true
		? And<IsArray<T1>, IsArray<T2>> extends true
			? DeepMergeArrays<T1, T2, Options>
			: Leaf<T1, T2>
		:
				| DeepMerge<T1, T2, Options>
				| ReturnType<
						NonNullable<
							ReturnType<NonNullable<GetOption<Options, "customMerge">>>
						>
				  >
	: ReturnType<
			NonNullable<ReturnType<NonNullable<GetOption<Options, "customMerge">>>>
	  >;

/**
 * Deep merge 2 arrays.
 */
type DeepMergeArrays<
	T1,
	T2,
	Options extends deepmerge.Options
> = T1 extends readonly [...infer E1]
	? T2 extends readonly [...infer E2]
		? GetOption<Options, "arrayMerge"> extends undefined
			? [...E1, ...E2]
			: ReturnType<NonNullable<GetOption<Options, "arrayMerge">>>
		: never
	: never;

/**
 * Get the leaf type from 2 types that can't be merged.
 */
type Leaf<T1, T2> = IsNever<T2> extends true
	? T1
	: IsNever<T1> extends true
	? T2
	: IsUndefinedOrNever<T2> extends true
	? T1
	: T2;

/**
 * Get the leaf type from 2 types that might not be able to be merged.
 */
type MaybeLeaf<T1, T2> = Or<
	Or<IsUndefinedOrNever<T1>, IsUndefinedOrNever<T2>>,
	Not<And<IsObjectOrArray<T1>, IsObjectOrArray<T2>>>
> extends true
	? Leaf<T1, T2>
	// TODO: Handle case where return type of "isMergeableObject" is a typeguard. If it is we can do better than just "unknown".
	: unknown;

/**
 * Flatten a complex type such as a union or intersection of objects into a
 * single object.
 */
type FlatternAlias<T> = {} & { [P in keyof T]: T[P] };

/**
 * Get the value of the given key in the given object.
 */
type ValueOfKey<T, K> = K extends keyof T ? T[K] : never;

/**
 * Safely test whether or not the first given types extends the second.
 *
 * Needed in particular for testing if a type is "never".
 */
type Is<T1, T2> = [T1] extends [T2] ? true : false;

/**
 * Safely test whether or not the given type is "never".
 */
type IsNever<T> = Is<T, never>;

/**
 * Is the given type undefined or never?
 */
type IsUndefinedOrNever<T> = Is<T, undefined>;

/**
 * Returns whether or not the give two types are the same.
 */
type IsSame<T1, T2> = Is<T1, T2> extends true ? Is<T2, T1> : false;

/**
 * Returns whether or not the given type an object (arrays are objects).
 */
type IsObjectOrArray<T> = And<Not<IsNever<T>>, T extends object ? true : false>;

/**
 * Returns whether or not the given type a non-array object.
 */
type IsObject<T> = And<IsObjectOrArray<T>, Not<IsArray<T>>>;

/**
 * Returns whether or not the given type an array.
 */
type IsArray<T> = And<
	Not<IsNever<T>>,
	T extends ReadonlyArray<any> ? true : false
>;

/**
 * And operator for types.
 */
type And<T1 extends boolean, T2 extends boolean> = T1 extends false
	? false
	: T2;

/**
 * Or operator for types.
 */
type Or<T1 extends boolean, T2 extends boolean> = T1 extends true ? true : T2;

/**
 * Not operator for types.
 */
type Not<T extends boolean> = T extends true ? false : true;

/**
 * A function that merges any 2 arrays.
 */
type ArrayMerge = (
	target: Array<any>,
	source: Array<any>,
	options: Required<deepmerge.Options>
) => any;

/**
 * A function that merges any 2 non-arrays objects.
 */
type ObjectMerge = (
	key: string,
	options: Required<deepmerge.Options>
) =>
	| ((target: any, source: any, options?: deepmerge.Options) => any)
	| undefined;

/**
 * A function that determins if any non-array object is mergable.
 */
type IsMergeable = (value: any) => boolean;

/**
 * The default config options.
 */
type DefaultOptions = {
	arrayMerge: undefined;
	clone: true;
	customMerge: undefined;
	isMergeableObject: undefined;
};

/**
 * Get the type of a given config option, defaulting to the default type if it
 * wasn't given.
 */
type GetOption<
	O extends deepmerge.Options,
	K extends keyof deepmerge.Options
> = undefined extends O[K] ? DefaultOptions[K] : O[K];

/**
 * Deeply merge two objects.
 *
 * @param target The first object.
 * @param source The second object.
 * @param options Deep merge options.
 */
declare function deepmerge<
	T1 extends object,
	T2 extends object,
	Options extends deepmerge.Options = DefaultOptions
>(target: T1, source: T2, options?: Options): DeepMerge<T1, T2, Options>;

declare namespace deepmerge {
	/**
	 * Deep merge config options.
	 */
	export type Options = {
		arrayMerge?: ArrayMerge;
		clone?: boolean;
		customMerge?: ObjectMerge;
		isMergeableObject?: IsMergeable;
	};

	/**
	 * Deeply merge two or more objects.
	 *
	 * @param objects An tuple of the objects to merge.
	 * @param options Deep merge options.
	 */
	export function all<
		Ts extends readonly [object, ...object[]],
		O extends Options = DefaultOptions
	>(objects: [...Ts], options?: O): DeepMergeAll<Ts, O>;

	/**
	 * Deeply merge two or more objects.
	 *
	 * @param objects An array of the objects to merge.
	 * @param options Deep merge options.
	 */
	export function all(
		objects: ReadonlyArray<object>,
		options?: Options
	): object;
}

export = deepmerge;
