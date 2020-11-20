import { deepmergeImpl } from "./impl"
import type { ExplicitOptions, Options } from "./options"
import { getFullOptions } from "./options"
import type { DeepMerge, DeepMergeAll } from "./types"

/**
 * Deeply merge two objects.
 *
 * @param target The first object.
 * @param source The second object.
 * @param options Deep merge options.
 */
export default function deepmerge<T1 extends object, T2 extends object, O extends Options = object>(
	target: T1,
	source: T2,
	options?: O,
): DeepMerge<T1, T2, ExplicitOptions<O>> {
	return deepmergeImpl(target, source, getFullOptions(options))
}

/**
 * Deeply merge two or more objects.
 *
 * @param objects An tuple of the objects to merge.
 * @param options Deep merge options.
 */
export function deepmergeAll<
	Ts extends readonly [object, ...ReadonlyArray<object>],
	O extends Options = object
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
		throw new TypeError(`first argument should be an array`)
	}

	return objects.reduce((prev, next) => deepmergeImpl(prev, next, getFullOptions(options)), {})
}
