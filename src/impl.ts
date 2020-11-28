import type { ExplicitOptions, FullOptions, Options } from "./options"
import type { DeepMerge, DeepMergeObjects, Property } from "./types"

function emptyTarget(value: unknown) {
	return Array.isArray(value) ? [] : {}
}

export function getDeepCloneFn(options: FullOptions) {
	return <T>(value: T): T => options.isMergeable(value)
		? deepmergeImpl(emptyTarget(value), value, options) as T
		: value
}

export function getDeepMergeFn<O extends Options>(
	options: FullOptions<O>,
): <T1 extends any, T2 extends any>(target: T1, source: T2) => DeepMerge<T1, T2, ExplicitOptions<O>> {
	return (target, source) => deepmergeImpl(target, source, options)
}

export function getSubtree<T>(value: T, options: FullOptions): T {
	return options.clone === false
		? value
		: options.clone === true
			? options.deepClone(value)
			: options.clone(value, options)
}

function getEnumerableOwnPropertySymbols(target: object) {
	return Object.getOwnPropertySymbols
		? Object.getOwnPropertySymbols(target).filter((symbol) =>
			Object.prototype.propertyIsEnumerable.call(target, symbol),
		)
		: []
}

function getKeys(target: object): Array<string> {
	// Symbols cannot be used to index objects yet.
	// So cast to an array of strings for simplicity.
	// @see https://github.com/microsoft/TypeScript/issues/1863
	// TODO: Remove cast once symbols indexing of objects is supported.
	return [ ...Object.keys(target), ...getEnumerableOwnPropertySymbols(target) ] as Array<string>
}

function propertyIsOnObject(object: object, property: Property): boolean {
	try {
		return property in object
	} catch {
		return false
	}
}

/**
 * Protects from prototype poisoning and unexpected merging up the prototype chain.
 */
export function propertyIsUnsafe(target: object, key: Property): boolean {
	return (
		// Properties are safe to merge if they don't exist in the target yet,
		propertyIsOnObject(target, key)
		// unsafe if they exist up the prototype chain,
		&& !(
			Object.hasOwnProperty.call(target, key)
			// and also unsafe if they're nonenumerable.
			&& Object.propertyIsEnumerable.call(target, key)
		)
	)
}

function mergeObject<
	T1 extends Record<Property, unknown>,
	T2 extends Record<Property, unknown>,
	O extends Options
>(target: T1, source: T2, options: FullOptions<O>): DeepMergeObjects<T1, T2, O> {
	const destination: any = {}

	if (options.isMergeable(target)) {
		getKeys(target).forEach((key) => {
			destination[key] = getSubtree(target[key], options)
		})
	}

	getKeys(source).forEach((key) => {
		if (propertyIsUnsafe(target, key)) {
			return
		}

		if (!options.isMergeable(source[key]) || !propertyIsOnObject(target, key)) {
			destination[key] = getSubtree(source[key], options)
		} else {
			destination[key] = typeof options.customMerge === `function`
				? options.customMerge(target[key], source[key], key, options)
				: deepmergeImpl(target[key], source[key], options)
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
		return getSubtree(source, options) as DeepMerge<T1, T2, ExplicitOptions<O>>
	}
	if (sourceIsArray) {
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
