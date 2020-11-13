import type { ExplicitOptions, FullOptions, Options } from "./options"
import { getFullOptions } from "./options"
import type { DeepMerge, DeepMergeAll, DeepMergeObjects, Property } from "./types"
import {
	cloneUnlessOtherwiseSpecified,
	getKeys,
	getMergeFunction,
	propertyIsOnObject,
	propertyIsUnsafe,
} from "./utils"

function mergeObject<
	T1 extends Record<Property, unknown>,
	T2 extends Record<Property, unknown>,
	O extends Options
>(target: T1, source: T2, options: FullOptions<O>): DeepMergeObjects<T1, T2, O> {
	const destination: any = {}

	if (options.isMergeable(target)) {
		getKeys(target).forEach((key) => {
			destination[key] = cloneUnlessOtherwiseSpecified(target[key], options)
		})
	}

	getKeys(source).forEach((key) => {
		if (propertyIsUnsafe(target, key)) {
			return
		}

		if (!options.isMergeable(source[key]) || !propertyIsOnObject(target, key)) {
			destination[key] = cloneUnlessOtherwiseSpecified(source[key], options)
		} else {
			destination[key] = getMergeFunction(key, options)(target[key], source[key], options)
		}
	})

	return destination
}

export function deepmergeImpl<T1 extends any, T2 extends any, O extends Options>(
	target: T1,
	source: T2,
	options: FullOptions<O>
): DeepMerge<T1, T2, ExplicitOptions<O>> {
	const sourceIsArray = Array.isArray(source)
	const targetIsArray = Array.isArray(target)
	const sourceAndTargetTypesMatch = sourceIsArray === targetIsArray

	if (!sourceAndTargetTypesMatch) {
		return cloneUnlessOtherwiseSpecified(source, options) as DeepMerge<T1, T2, ExplicitOptions<O>>
	} else if (sourceIsArray) {
		return options.arrayMerge(target as unknown[], source as unknown[], options) as DeepMerge<
			T1,
			T2,
			ExplicitOptions<O>
		>
	} else {
		return mergeObject(
			target as Record<Property, unknown>,
			source as Record<Property, unknown>,
			options
		) as DeepMerge<T1, T2, ExplicitOptions<O>>
	}
}

/**
 * Deeply merge two objects.
 *
 * @param target The first object.
 * @param source The second object.
 * @param options Deep merge options.
 */
export default function deepmerge<
	T1 extends object,
	T2 extends object,
	O extends Options = {}
>(target: T1, source: T2, options?: O) {
	return deepmergeImpl(target, source, getFullOptions(options))
}

/**
 * Deeply merge two or more objects.
 *
 * @param objects An tuple of the objects to merge.
 * @param options Deep merge options.
 */
export function deepmergeAll<
	Ts extends readonly [object, ...object[]],
	O extends Options = {}
>(objects: [...Ts], options?: O): DeepMergeAll<Ts, ExplicitOptions<O>>

/**
 * Deeply merge two or more objects.
 *
 * @param objects An array of the objects to merge.
 * @param options Deep merge options.
 */
export function deepmergeAll(objects: ReadonlyArray<object>, options?: Options): object
export function deepmergeAll(objects: ReadonlyArray<object>, options?: Options): object {
	if (!Array.isArray(objects)) {
		throw new Error(`first argument should be an array`)
	}

	return objects.reduce((prev, next) => deepmergeImpl(prev, next, getFullOptions(options)), {})
}
