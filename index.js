var isMergeableObject = require('is-mergeable-object')

function emptyTarget(val) {
	return Array.isArray(val) ? [] : {}
}

function cloneUnlessOtherwiseSpecified(value, optionsArgument, key) {
	var clone = !optionsArgument || optionsArgument.clone !== false

	return (clone && _isMergeableObject(value, optionsArgument, key))
		? deepmerge(emptyTarget(value), value, optionsArgument)
		: value
}

function _isMergeableObject(value, optionsArgument, key) {
	let ret;
	if (optionsArgument && optionsArgument.isMergeableObject) {
		ret = optionsArgument.isMergeableObject(value, isMergeableObject, optionsArgument, key)
	}
	if (ret === null || typeof ret === 'undefined') {
		ret = isMergeableObject(value)
	}
	return ret
}

function defaultArrayMerge(target, source, optionsArgument) {
	return target.concat(source).map(function(element, index) {
		return cloneUnlessOtherwiseSpecified(element, optionsArgument, index)
	})
}

function mergeObject(target, source, optionsArgument) {
	var destination = {}
	if (_isMergeableObject(target, optionsArgument)) {
		Object.keys(target).forEach(function(key) {
			destination[key] = cloneUnlessOtherwiseSpecified(target[key], optionsArgument, key)
		})
	}
	Object.keys(source).forEach(function(key) {
		if (!_isMergeableObject(source[key], optionsArgument, key) || !target[key]) {
			destination[key] = cloneUnlessOtherwiseSpecified(source[key], optionsArgument, key)
		} else {
			destination[key] = deepmerge(target[key], source[key], optionsArgument)
		}
	})
	return destination
}

function deepmerge(target, source, optionsArgument) {
	var sourceIsArray = Array.isArray(source)
	var targetIsArray = Array.isArray(target)
	var options = optionsArgument || { arrayMerge: defaultArrayMerge }
	var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray

	if (!sourceAndTargetTypesMatch) {
		return cloneUnlessOtherwiseSpecified(source, optionsArgument)
	} else if (sourceIsArray) {
		var arrayMerge = options.arrayMerge || defaultArrayMerge
		return arrayMerge(target, source, optionsArgument)
	} else {
		return mergeObject(target, source, optionsArgument)
	}
}

deepmerge.all = function deepmergeAll(array, optionsArgument) {
	if (!Array.isArray(array)) {
		throw new Error('first argument should be an array')
	}

	return array.reduce(function(prev, next) {
		return deepmerge(prev, next, optionsArgument)
	}, {})
}

module.exports = deepmerge
