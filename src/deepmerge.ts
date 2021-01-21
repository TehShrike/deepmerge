import isPlainObj from "is-plain-obj"

function defaultIsMergeable(value) {
	return Array.isArray(value) || isPlainObj(value)
}

function emptyTarget(value) {
	return Array.isArray(value) ? [] : {}
}

function cloneUnlessOtherwiseSpecified(value, options) {
	return (options.clone && options.isMergeable(value))
		? deepmerge(emptyTarget(value), value, options)
		: value
}

function defaultArrayMerge(target, source, options) {
	return target
		.concat(source)
		.map((element) => cloneUnlessOtherwiseSpecified(element, options))
}

function getMergeFunction(key, options) {
	if (!options.customMerge) {
		return deepmerge
	}

	const customMerge = options.customMerge(key)
	return typeof customMerge === `function` ? customMerge : deepmerge
}

function getEnumerableOwnPropertySymbols(target) {
	return Object.getOwnPropertySymbols
		? Object.getOwnPropertySymbols(target).filter((symbol) =>
			Object.prototype.propertyIsEnumerable.call(target, symbol),
		)
		: []
}

function getKeys(target) {
	return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target))
}

function propertyIsOnObject(object, property) {
	try {
		return property in object
	} catch {
		return false
	}
}

// Protects from prototype poisoning and unexpected merging up the prototype chain.
function propertyIsUnsafe(target, key) {
	return propertyIsOnObject(target, key) // Properties are safe to merge if they don't exist in the target yet,
		&& !(Object.hasOwnProperty.call(target, key) // unsafe if they exist up the prototype chain,
			&& Object.propertyIsEnumerable.call(target, key)) // and also unsafe if they're nonenumerable.
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
