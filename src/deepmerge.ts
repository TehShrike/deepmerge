import isPlainObj from 'is-plain-obj'

function defaultIsMergeable(value) {
	return Array.isArray(value) || isPlainObj(value)
}

function emptyTarget(val) {
	return Array.isArray(val) ? [] : {}
}

function cloneUnlessOtherwiseSpecified(value, options) {
	return (options.clone !== false && options.isMergeable(value))
		? deepmergeImpl(emptyTarget(value), value, options)
		: value
}

function defaultArrayMerge(target, source, options) {
	return target.concat(source).map((element) =>
		cloneUnlessOtherwiseSpecified(element, options)
	)
}

function getMergeFunction(key, options) {
	if (!options.customMerge) {
		return deepmergeImpl
	}
	const customMerge = options.customMerge(key)
	return typeof customMerge === 'function' ? customMerge : deepmergeImpl
}

function getEnumerableOwnPropertySymbols(target) {
	return Object.getOwnPropertySymbols
		? Object.getOwnPropertySymbols(target).filter((symbol) =>
			target.propertyIsEnumerable(symbol)
		)
		: []
}

function getKeys(target) {
	return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target))
}

function propertyIsOnObject(object, property) {
	try {
		return property in object
	} catch(_) {
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
	const destination = {}
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

function deepmergeImpl(target, source, options) {
	const sourceIsArray = Array.isArray(source)
	const targetIsArray = Array.isArray(target)
	const sourceAndTargetTypesMatch = sourceIsArray === targetIsArray

	if (!sourceAndTargetTypesMatch) {
		return cloneUnlessOtherwiseSpecified(source, options)
	} else if (sourceIsArray) {
		return options.arrayMerge(target, source, options)
	} else {
		return mergeObject(target, source, options)
	}
}

function getFullOptions(options) {
	const overrides =
		options === undefined
			? undefined
			: (Object.fromEntries(
					// Filter out keys explicitly set to undefined.
					Object.entries(options).filter(([key, value]) => value !== undefined)
				))

	return {
		arrayMerge: defaultArrayMerge,
		isMergeable: defaultIsMergeable,
		clone: true,
	  ...overrides,
		cloneUnlessOtherwiseSpecified
	};
}

export default function deepmerge(target, source, options) {
	return deepmergeImpl(target, source, getFullOptions(options))
}

export function deepmergeAll(array, options) {
	if (!Array.isArray(array)) {
		throw new Error('first argument should be an array')
	}

	return array.reduce((prev, next) =>
		deepmergeImpl(prev, next, getFullOptions(options)), {}
	)
}
