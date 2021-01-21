import { deepmergeImpl } from './deepmerge'
import type { FullOptions, ObjectMerge } from "./options"
import type { Property } from "./types"

export function emptyTarget(value: unknown) {
	return Array.isArray(value) ? [] : {}
}

export function cloneUnlessOtherwiseSpecified<T>(value: T, options: FullOptions): T {
	return (options.clone && options.isMergeable(value))
		? deepmergeImpl(emptyTarget(value), value, options) as T
		: value
}

function getEnumerableOwnPropertySymbols(target: object) {
	return Object.getOwnPropertySymbols
		? Object.getOwnPropertySymbols(target).filter((symbol) =>
			Object.prototype.propertyIsEnumerable.call(target, symbol),
		)
		: []
}

export function getKeys(target: object) {
	// Symbols cannot be used to index objects yet.
	// So cast to an array of strings for simplicity.
	// @see https://github.com/microsoft/TypeScript/issues/1863
	// TODO: Remove cast once symbols indexing of objects is supported.
	return [ ...Object.keys(target), ...getEnumerableOwnPropertySymbols(target) ] as Array<string>
}

export function propertyIsOnObject(object: object, property: Property) {
	try {
		return property in object
	} catch {
		return false
	}
}

export function getMergeFunction(
	key: Property,
	options: FullOptions,
): NonNullable<ReturnType<ObjectMerge>> {
	if (!options.customMerge) {
		return deepmergeImpl
	}

	const customMerge = options.customMerge(key)
	return typeof customMerge === `function` ? customMerge : deepmergeImpl
}

// Protects from prototype poisoning and unexpected merging up the prototype chain.
export function propertyIsUnsafe(target: object, key: Property) {
	return propertyIsOnObject(target, key) // Properties are safe to merge if they don't exist in the target yet,
		&& !(Object.hasOwnProperty.call(target, key) // unsafe if they exist up the prototype chain,
			&& Object.propertyIsEnumerable.call(target, key)) // and also unsafe if they're nonenumerable.
}
