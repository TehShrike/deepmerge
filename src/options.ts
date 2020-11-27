import isPlainObj from "is-plain-obj"

import { cloneUnlessOtherwiseSpecified } from "./impl"
import type { FlattenAlias, Property } from "./types"

/**
 * Deep merge options.
 */
export type Options = Partial<{
	readonly arrayMerge?: ArrayMerge
	readonly clone?: boolean
	readonly customMerge?: ObjectMerge
	readonly isMergeable?: IsMergeable
}>

/**
 * Deep merge options with explicit keys.
 */
export type ExplicitOptions<O extends Options = Options> = {
	readonly [K in keyof Options]-?: undefined extends O[K] ? never : O[K]
}

/**
 * Deep merge options with defaults applied.
 */
export type FullOptions<O extends Options = Options> = FlattenAlias<{
	readonly arrayMerge: O[`arrayMerge`] extends undefined
		? typeof defaultArrayMerge
		: NonNullable<O[`arrayMerge`]>
	readonly clone: O[`clone`] extends undefined ? typeof defaultClone : NonNullable<O[`clone`]>
	readonly customMerge?: O[`customMerge`]
	readonly isMergeable: O[`isMergeable`] extends undefined
		? typeof defaultIsMergeable
		: NonNullable<O[`isMergeable`]>
	readonly cloneUnlessOtherwiseSpecified: <T>(value: T, options: FullOptions) => T
}>

/**
 * A function that determins if a type is mergable.
 */
export type IsMergeable = (value: any) => boolean

/**
 * A function that merges any 2 arrays.
 */
export type ArrayMerge<T1 = any, T2 = any> = (target: Array<T1>, source: Array<T2>, options: FullOptions) => any

/**
 * A function that merges any 2 non-arrays values.
 */
export type ObjectMerge<K = any> = (
	key: K
) => ((target: any, source: any, options: FullOptions) => any) | undefined

const defaultClone = false as const

function defaultIsMergeable(value: unknown): value is Record<Property, unknown> | Array<unknown> {
	return Array.isArray(value) || isPlainObj(value)
}

function defaultArrayMerge<T1 extends unknown, T2 extends unknown>(
	target: ReadonlyArray<T1>,
	source: ReadonlyArray<T2>,
	options: FullOptions,
) {
	return [ ...target, ...source ].map((element) =>
		cloneUnlessOtherwiseSpecified(element, options),
	) as T1 extends readonly [...infer E1]
		? T2 extends readonly [...infer E2]
			? [...E1, ...E2]
			: never
		: never
}

export function getFullOptions<O extends Options>(options?: O): FullOptions<O> {
	const overrides
		= options === undefined
			? undefined
			: (Object.fromEntries(
				// Filter out keys explicitly set to undefined.
				Object.entries(options).filter(([ _key, value ]) => value !== undefined),
			) as O)

	return {
		arrayMerge: defaultArrayMerge,
		isMergeable: defaultIsMergeable,
		clone: defaultClone,
		...overrides,
		cloneUnlessOtherwiseSpecified,
	} as unknown as FullOptions<O>
}
