import type { ExplicitOptions, FullOptions, Options } from "./options"
import { getFullOptions } from "./options"
import type { DeepMerge, DeepMergeAll, DeepMergeObjects, Property } from "./types"
import {
	cloneUnlessOtherwiseSpecified,
	emptyTarget,
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
	const destination: any = options.clone ? emptyTarget(target) : target

	if (options.isMergeable(target)) {
		getKeys(target).forEach(
			(key) =>
				(destination[key] = cloneUnlessOtherwiseSpecified(target[key], options)),
		)
	}

	getKeys(source).forEach((key) => {
		if (propertyIsUnsafe(target, key)) {
			return
		}

		if (propertyIsOnObject(target, key) && options.isMergeable(source[key])) {
			destination[key] = getMergeFunction(key, options)(
				target[key],
				source[key],
				options,
			)
		} else {
			destination[key] = cloneUnlessOtherwiseSpecified(source[key], options)
		}
	})

	return destination
}

export function deepmergeImpl<T1 extends any, T2 extends any, O extends Options>(
	target: T1,
	source: T2,
	options: FullOptions<O>,
): DeepMerge<T1, T2, ExplicitOptions<O>> {
	const sourceIsArray = Array.isArray(source)
	const targetIsArray = Array.isArray(target)
	const sourceAndTargetTypesMatch = sourceIsArray === targetIsArray

	if (!sourceAndTargetTypesMatch) {
		return cloneUnlessOtherwiseSpecified(source, options) as DeepMerge<T1, T2, ExplicitOptions<O>>
	} else if (sourceIsArray) {
		return options.arrayMerge(
			target as Array<unknown>,
			source as Array<unknown>,
			options,
		) as DeepMerge<T1, T2, ExplicitOptions<O>>
	}
	return mergeObject(
		target as Record<Property, unknown>,
		source as Record<Property, unknown>,
		options,
	) as DeepMerge<T1, T2, ExplicitOptions<O>>
}

/**
 * Deeply merge two objects.
 *
 * @param target The first object.
 * @param source The second object.
 * @param options Deep merge options.
 */
export function deepmerge<
	T1 extends object,
	T2 extends object,
	O extends Options = {}
>(target: T1, source: T2, options?: O): DeepMerge<T1, T2, ExplicitOptions<O>> {
	return deepmergeImpl(target, source, getFullOptions(options))
}

/**
 * Deeply merge two or more objects.
 *
 * @param objects An tuple of the objects to merge.
 * @param options Deep merge options.
 */
export function deepmergeAll<
	Ts extends readonly [object, ...Array<object>],
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

	const fullOptions = getFullOptions(options)

	if (objects.length === 0) {
		return {}
	} else if (objects.length === 1) {
		const value = objects[0]
		return fullOptions.clone
			? deepmergeImpl(emptyTarget(value), value, fullOptions)
			: value
	}

	return objects.reduce((prev, next) => deepmergeImpl(prev, next, fullOptions), {})
}
