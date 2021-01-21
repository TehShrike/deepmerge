import isPlainObj from "is-plain-obj"

import type { Property } from "./types"
import { cloneUnlessOtherwiseSpecified } from "./utils"

/**
 * deepmerge's options.
 */
export type Options = Partial<{
	arrayMerge?: ArrayMerge
	clone?: boolean
	customMerge?: ObjectMerge
	isMergeable?: IsMergeable
}>

/**
 * deepmerge's options with explicit keys.
 */
export type ExplicitOptions<O extends Options = Options> = {
	[K in keyof Options]-?: undefined extends O[K] ? never : O[K]
}

/**
 * deepmerge's options with defaults applied.
 */
export type FullOptions<O extends Options = Options> = {
	arrayMerge: O[`arrayMerge`] extends undefined
		? typeof defaultArrayMerge
		: NonNullable<O[`arrayMerge`]>
	clone: O[`clone`] extends undefined ? true : NonNullable<O[`clone`]>
	customMerge?: O[`customMerge`]
	isMergeable: O[`isMergeable`] extends undefined
		? typeof defaultIsMergeable
		: NonNullable<O[`isMergeable`]>
	cloneUnlessOtherwiseSpecified: <T>(value: T, options: FullOptions) => T
}

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
export type ObjectMerge<K = Property> = (
	key: K
) => ((target: any, source: any, options: FullOptions) => any) | undefined


function defaultIsMergeable(value: unknown): value is Record<Property, unknown> | Array<unknown> {
	return Array.isArray(value) || isPlainObj(value)
}

function defaultArrayMerge<T1 extends unknown, T2 extends unknown>(
	target: ReadonlyArray<T1>,
	source: ReadonlyArray<T2>,
	options: FullOptions,
) {
	return [ ...target, ...source ]
		.map((element) => cloneUnlessOtherwiseSpecified(element, options)) as T1 extends readonly [...infer E1]
		? T2 extends readonly [...infer E2]
			? [...E1, ...E2]
			: never
		: never
}

export function getFullOptions<O extends Options>(inputOptions?: O) {
	const overrides = inputOptions === undefined
		? undefined
		: Object.fromEntries(
			// Filter out keys explicitly set to undefined.
			Object.entries(inputOptions).filter(
				([ _key, value ]) => value !== undefined,
			),
		) as O

	return {
		arrayMerge: defaultArrayMerge,
		isMergeable: defaultIsMergeable,
		clone: false,
		...overrides,
		// cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
		// implementations can use it. The caller may not replace it.
		cloneUnlessOtherwiseSpecified,
	} as FullOptions<O>
}
