import { deepmerge } from './deepmerge'

function emptyTarget(value) {
	return Array.isArray(value) ? [] : {}
}

export function cloneUnlessOtherwiseSpecified(value, options) {
	return (options.clone && options.isMergeable(value))
		? deepmerge(emptyTarget(value), value, options)
		: value
}

function getEnumerableOwnPropertySymbols(target) {
	return Object.getOwnPropertySymbols
		? Object.getOwnPropertySymbols(target).filter((symbol) =>
			Object.prototype.propertyIsEnumerable.call(target, symbol),
		)
		: []
}

export function getKeys(target) {
	return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target))
}

export function propertyIsOnObject(object, property) {
	try {
		return property in object
	} catch {
		return false
	}
}

export function getMergeFunction(key, options) {
	if (!options.customMerge) {
		return deepmerge
	}

	const customMerge = options.customMerge(key)
	return typeof customMerge === `function` ? customMerge : deepmerge
}

// Protects from prototype poisoning and unexpected merging up the prototype chain.
export function propertyIsUnsafe(target, key) {
	return propertyIsOnObject(target, key) // Properties are safe to merge if they don't exist in the target yet,
		&& !(Object.hasOwnProperty.call(target, key) // unsafe if they exist up the prototype chain,
			&& Object.propertyIsEnumerable.call(target, key)) // and also unsafe if they're nonenumerable.
}
