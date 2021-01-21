import isPlainObj from "is-plain-obj"

import {
	cloneUnlessOtherwiseSpecified,
	getKeys,
	getMergeFunction,
	propertyIsOnObject,
	propertyIsUnsafe,
} from "./utils"

function defaultIsMergeable(value) {
	return Array.isArray(value) || isPlainObj(value)
}

function defaultArrayMerge(target, source, options) {
	return target
		.concat(source)
		.map((element) => cloneUnlessOtherwiseSpecified(element, options))
}

function mergeObject(target, source, options) {
	const destination = options.clone ? emptyTarget(target) : target

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

function cloneOptionsWithDefault(inputOptions) {
	return {
		arrayMerge: defaultArrayMerge,
		isMergeable: defaultIsMergeable,
		clone: true,
		...inputOptions,
		// cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
		// implementations can use it. The caller may not replace it.
		cloneUnlessOtherwiseSpecified,
	}
}

export function deepmerge(target, source, inputOptions) {
	const options = cloneOptionsWithDefault(inputOptions)

	const sourceIsArray = Array.isArray(source)
	const targetIsArray = Array.isArray(target)
	const sourceAndTargetTypesMatch = sourceIsArray === targetIsArray

	if (!sourceAndTargetTypesMatch) {
		return cloneUnlessOtherwiseSpecified(source, options)
	} else if (sourceIsArray) {
		return options.arrayMerge(target, source, options)
	}
	return mergeObject(target, source, options)
}

export function deepmergeAll(array, inputOptions) {
	if (!Array.isArray(array)) {
		throw new Error(`first argument should be an array`)
	}

	const options = cloneOptionsWithDefault(inputOptions)

	if (array.length === 0) {
		return {}
	} else if (array.length === 1) {
		const value = array[0]
		return options.clone
			? deepmerge(emptyTarget(value), value, options)
			: value
	}

	return array.reduce((prev, next) => deepmerge(prev, next, options))
}
