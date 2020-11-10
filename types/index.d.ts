// Minimum TypeScript Version: 4.2
// TODO: Can be reduce to version 4.1 upon it's release.

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

type DeepMergeNonPrimitive<
	T1,
	T2,
	Options extends deepmerge.Options
> = ShouldMergeArrays<T1, T2> extends true
	? DeepMergeArrays<T1, T2, Options>
	: DeepMergeObjects<T1, T2, Options>;

type DeepMergeObjects<
	T1,
	T2,
	Options extends deepmerge.Options
> = ShouldMergeObjects<T1, T2> extends true
	? DeepMergeObjectProps<T1, T2, Options>
	: MergeLeafs<T1, T2>;

// @see https://github.com/microsoft/TypeScript/issues/41448
type DeepMergeObjectProps<
	T1,
	T2,
	Options extends deepmerge.Options
> = FlatternAlias<
	{
		-readonly [K in keyof T1]: Options["customMerge"] extends undefined
			? DeepMerge<ValueOfKey<T1, K>, ValueOfKey<T2, K>, Options>
			: ReturnType<NonNullable<Options["customMerge"]>> extends undefined
			? DeepMerge<ValueOfKey<T1, K>, ValueOfKey<T2, K>, Options>
			: ReturnType<
					NonNullable<ReturnType<NonNullable<Options["customMerge"]>>>
			  >;
	} &
		{
			-readonly [K in keyof T2]: Options["customMerge"] extends undefined
				? DeepMerge<ValueOfKey<T1, K>, ValueOfKey<T2, K>, Options>
				: ReturnType<NonNullable<Options["customMerge"]>> extends undefined
				? DeepMerge<ValueOfKey<T1, K>, ValueOfKey<T2, K>, Options>
				: ReturnType<
						NonNullable<ReturnType<NonNullable<Options["customMerge"]>>>
				  >;
		}
>;

type DeepMergeArrays<
	T1,
	T2,
	Options extends deepmerge.Options
> = T1 extends readonly [...infer E1]
	? T2 extends readonly [...infer E2]
		? Options["arrayMerge"] extends undefined
			? [...E1, ...E2]
			: ReturnType<NonNullable<Options["arrayMerge"]>>
		: never
	: never;

type MergeLeafs<T1, T2> = Is<T2, never> extends true
	? T1
	: Is<T1, never> extends true
	? T2
	: Is<T2, undefined> extends true
	? T1
	: T2;

type FlatternAlias<T> = T extends any
	? {
			[K in keyof T]: T[K];
	  }
	: never;

type ValueOfKey<T, K> = K extends keyof T ? T[K] : never;

type Is<T1, T2> = [T1] extends [T2] ? true : false;

type IsSame<T1, T2> = Is<T1, T2> extends true ? Is<T2, T1> : false;

type IsObjectOrArray<T> = Is<T, never> extends true ? false : Is<T, object>;

type IsObject<T> = Is<T, ReadonlyArray<any>> extends true
	? false
	: IsObjectOrArray<T>;

type ShouldMergeObjects<T1, T2> = IsObject<T1> extends true
	? IsObject<T2>
	: false;

type ShouldMergeArrays<T1, T2> = Is<T1, ReadonlyArray<any>> extends true
	? Is<T2, ReadonlyArray<any>>
	: false;

type ArrayMerge = (
	target: Array<any>,
	source: Array<any>,
	options: Required<deepmerge.Options>
) => any;

type ObjectMerge = (
	key: string,
	options: Required<deepmerge.Options>
) =>
	| ((target: any, source: any, options?: deepmerge.Options) => any)
	| undefined;

type IsMergeable = (value: any) => boolean;

type DefaultOptions = {
	arrayMerge: undefined;
	clone: true;
	customMerge: undefined;
	isMergeableObject: undefined;
};

/**
 * Deeply merge two objects.
 *
 * @param target the first obj
 * @param source the second obj
 * @param options deepmerge option
 */
declare function deepmerge<
	T1 extends object,
	T2 extends object,
	Options extends deepmerge.Options = DefaultOptions
>(target: T1, source: T2, options?: Options): DeepMerge<T1, T2, Options>;

declare namespace deepmerge {
	export type Options = {
		arrayMerge?: ArrayMerge;
		clone?: boolean;
		customMerge?: ObjectMerge;
		isMergeableObject?: IsMergeable;
	};

	export function all<
		Ts extends readonly [object, ...object[]],
		O extends Options = DefaultOptions
	>(objects: [...Ts], options?: O): DeepMergeAll<Ts, O>;
	export function all(
		objects: ReadonlyArray<object>,
		options?: Options
	): object;
}

export = deepmerge;
