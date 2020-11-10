// Minimum TypeScript Version: 4.2
// TODO: Can be reduce to version 4.1 upon it's release.

/**
 * Deep merge 1 or more types given in an array.
 */
type DeepMergeAll<
	Ts extends readonly [any, ...any[]],
	Options extends deepmerge.Options
> = Ts extends readonly [infer T1, ...any[]]
	? Ts extends readonly [any, infer T2, ...infer TRest]
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
	: IsObjectOrArray<T1> extends true
	? IsObjectOrArray<T2> extends true
		? DeepMergeNonPrimitive<T1, T2, Options>
		: MergeLeafs<T1, T2>
	: MergeLeafs<T1, T2>;

/**
 * Deep merge 2 objects (they may be arrays).
 */
type DeepMergeNonPrimitive<
	T1,
	T2,
	Options extends deepmerge.Options
> = ShouldMergeArrays<T1, T2> extends true
	? DeepMergeArrays<T1, T2, Options>
	: DeepMergeObjects<T1, T2, Options>;

/**
 * Deep merge 2 non-array types.
 */
type DeepMergeObjects<
	T1,
	T2,
	Options extends deepmerge.Options
> = ShouldMergeObjects<T1, T2> extends true
	? DeepMergeObjectProps<T1, T2, Options>
	: MergeLeafs<T1, T2>;

/**
 * Deep merge 2 non-array objects.
 */
type DeepMergeObjectProps<
	T1,
	T2,
	Options extends deepmerge.Options
> = FlatternAlias<
	// @see https://github.com/microsoft/TypeScript/issues/41448
	{
		-readonly [K in keyof T1]: DeepMergeProps<
			ValueOfKey<T1, K>,
			ValueOfKey<T2, K>,
			Options
		>;
	} &
		{
			-readonly [K in keyof T2]: DeepMergeProps<
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
type DeepMergeProps<T1, T2, Options extends deepmerge.Options> = GetOption<
	Options,
	"isMergeableObject"
> extends undefined
	? GetOption<Options, "customMerge"> extends undefined
		? DeepMerge<T1, T2, Options>
		: DeepMergePropsCustom<T1, T2, Options>
	: MergeMaybeLeafs<T1, T2, Options>;

/**
 * Deep merge 2 types that are known to be properties of an object being deeply
 * merged and where a "customMerge" function has been provided.
 */
type DeepMergePropsCustom<
	T1,
	T2,
	Options extends deepmerge.Options
> = ReturnType<NonNullable<GetOption<Options, "customMerge">>> extends undefined
	? DeepMerge<T1, T2, Options>
	: undefined extends ReturnType<NonNullable<GetOption<Options, "customMerge">>>
	? IsArray<T1> extends true
		? IsArray<T2> extends true
			? DeepMergeArrays<T1, T2, Options>
			: MergeLeafs<T1, T2>
		: IsArray<T2> extends true
		? MergeLeafs<T1, T2>
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
 * Get the leaf type of 2 types that can't be merged.
 */
type MergeLeafs<T1, T2> = Is<T2, never> extends true
	? T1
	: Is<T1, never> extends true
	? T2
	: Is<T2, undefined> extends true
	? T1
	: T2;

/**
 * Get the leaf type of 2 types that might not be able to be merged.
 */
type MergeMaybeLeafs<T1, T2, Options extends deepmerge.Options> = Is<
	T2,
	never
> extends true
	? T1
	: Is<T1, never> extends true
	? T2
	: Is<T2, undefined> extends true
	? T1
	: Is<T1, undefined> extends true
	? T2
	: Is<T1, object> extends false
	? DeepMerge<T1, T2, Options>
	: Is<T2, object> extends false
	? DeepMerge<T1, T2, Options>
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
 * Returns whether or not the give two types are the same.
 */
type IsSame<T1, T2> = Is<T1, T2> extends true ? Is<T2, T1> : false;

/**
 * Returns whether or not the given type an object (arrays are objects).
 */
type IsObjectOrArray<T> = Is<T, never> extends true ? false : Is<T, object>;

/**
 * Returns whether or not the given type a non-array object.
 */
type IsObject<T> = IsArray<T> extends true
	? false
	: IsObjectOrArray<T>;

/**
 * Returns whether or not the given type an array.
 */
type IsArray<T> = Is<T, ReadonlyArray<any>>;

/**
 * Returns whether or not 2 types are both non-array objects that can be merged.
 */
type ShouldMergeObjects<T1, T2> = IsObject<T1> extends true
	? IsObject<T2>
	: false;

/**
 * Returns whether or not 2 types are both arrays that can be merged.
 */
type ShouldMergeArrays<T1, T2> = IsArray<T1> extends true
	? IsArray<T2>
	: false;

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
