var defaultIsMergeableObject = require('is-mergeable-object')

function emptyTarget(val) {
	return Array.isArray(val) ? [] : {}
}

function cloneUnlessOtherwiseSpecified(value, options) {
	return (options.clone !== false && options.isMergeableObject(value))
		? deepmerge(emptyTarget(value), value, options)
		: value
}

function defaultArrayMerge(target, source, options) {
	return target.concat(source).map(function(element) {
		return cloneUnlessOtherwiseSpecified(element, options)
	})
}

function getMergeFunction(key, options) {
	if (!options.customMerge) {
		return deepmerge
	}
	var customMerge = options.customMerge(key)
	return typeof customMerge === 'function' ? customMerge : deepmerge
}

function getEnumerableOwnPropertySymbols(target) {
	return Object.getOwnPropertySymbols
		? Object.getOwnPropertySymbols(target).filter(function(symbol) {
			return Object.propertyIsEnumerable.call(target, symbol)
		})
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

function mergeObject(target, source, options, inPlace) {
	var destination = inPlace ? target : {}
	if (!inPlace && options.isMergeableObject(target)) {
		getKeys(target).forEach(function(key) {
			destination[key] = cloneUnlessOtherwiseSpecified(target[key], options)
		})
	}
	getKeys(source).forEach(function(key) {
		if (propertyIsUnsafe(target, key)) {
			return
		}

		if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
			destination[key] = inPlace
				? mergeInPlace(target[key], source[key], options, inPlace)
				: getMergeFunction(key, options)(target[key], source[key], options)
		} else {
			destination[key] = cloneUnlessOtherwiseSpecified(source[key], options)
		}
	})
	return destination
}

function deepmerge(target, source, options) {
	options = options || {}
	options.arrayMerge = options.arrayMerge || defaultArrayMerge
	options.isMergeableObject = options.isMergeableObject || defaultIsMergeableObject
	// cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
	// implementations can use it. The caller may not replace it.
	options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified

	var sourceIsArray = Array.isArray(source)
	var targetIsArray = Array.isArray(target)
	var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray

	if (!sourceAndTargetTypesMatch) {
		return cloneUnlessOtherwiseSpecified(source, options)
	} else if (sourceIsArray) {
		return options.arrayMerge(target, source, options)
	} else {
		return mergeObject(target, source, options)
	}
}

// Reuse the accumulator owned by deepmerge.all().
function mergeInPlace(target, source, options, inPlace) {
	if (Array.isArray(target) !== Array.isArray(source)) {
		return deepmerge(target, source, options)
	} else if (!options.isMergeableObject(target)) {
		var result = deepmerge(target, source, options)
		// Later copies may remove unsafe keys or change the prototype.
		if (!copiesUnchanged(result, options)) {
			inPlace.stop = true
		}
		return result
	} else if (Array.isArray(source)) {
		if (Object.getPrototypeOf(target) !== Array.prototype) {
			return deepmerge(target, source, options)
		}
		var appended = defaultArrayMerge([], source, options)
		var offset = target.length
		target.length += appended.length
		appended.forEach(function(element, index) {
			target[offset + index] = element
		})
		return target
	}
	return mergeObject(target, source, options, inPlace)
}

// Whether copying preserves the value's keys and prototype.
function copiesUnchanged(value, options) {
	if (!options.isMergeableObject(value)) {
		return true
	} else if (Array.isArray(value)) {
		return Object.getPrototypeOf(value) === Array.prototype
			&& value.every(function(element) {
				return copiesUnchanged(element, options)
			})
	}
	return Object.getPrototypeOf(value) === Object.prototype
		&& getKeys(value).every(function(key) {
			return !propertyIsUnsafe({}, key) && copiesUnchanged(value[key], options)
		})
}

deepmerge.all = function deepmergeAll(array, options) {
	if (!Array.isArray(array)) {
		throw new Error('first argument should be an array')
	}

	// Reuse the result only when the default merge owns its copies.
	options = options || {}
	var inPlace = options.clone !== false
		&& !options.customMerge
		&& (!options.arrayMerge || options.arrayMerge === defaultArrayMerge)
		&& (!options.isMergeableObject || options.isMergeableObject === defaultIsMergeableObject)
		? { stop: false }
		: null
	// Don't rely on deepmerge() filling in the caller's options.
	var defaults = {
		arrayMerge: defaultArrayMerge,
		isMergeableObject: defaultIsMergeableObject,
		cloneUnlessOtherwiseSpecified: cloneUnlessOtherwiseSpecified
	}

	var first = true
	return array.reduce(function(prev, next) {
		var result = inPlace && !first && !inPlace.stop
			? mergeInPlace(prev, next, defaults, inPlace)
			: deepmerge(prev, next, options)
		first = false
		return result
	}, {})
}

module.exports = deepmerge
