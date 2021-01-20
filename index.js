const isPlainObj = require(`is-plain-obj`)

const defaultIsMergeable = value => Array.isArray(value) || isPlainObj(value)
const emptyTarget = value => Array.isArray(value) ? [] : {}

const cloneUnlessOtherwiseSpecified = (value, options) => {
	return (options.clone !== false && options.isMergeable(value))
		? deepmerge(emptyTarget(value), value, options)
		: value
}

const defaultArrayMerge = (target, source, options) => {
	return target.concat(source)
		.map(element => cloneUnlessOtherwiseSpecified(element, options))
}

const getMergeFunction = (key, options) => {
	if (!options.customMerge) {
		return deepmerge
	}

	const customMerge = options.customMerge(key)
	return typeof customMerge === `function` ? customMerge : deepmerge
}

const getEnumerableOwnPropertySymbols = target => {
	return Object.getOwnPropertySymbols
		? Object.getOwnPropertySymbols(target)
			.filter(symbol => target.propertyIsEnumerable(symbol))
		: []
}

const getKeys = target => Object.keys(target).concat(getEnumerableOwnPropertySymbols(target))

const propertyIsOnObject = (object, property) => {
	try {
		return property in object
	} catch (_) {
		return false
	}
}

// Protects from prototype poisoning and unexpected merging up the prototype chain.
const propertyIsUnsafe = (target, key) => {
	return propertyIsOnObject(target, key) // Properties are safe to merge if they don't exist in the target yet,
		&& !(Object.hasOwnProperty.call(target, key) // unsafe if they exist up the prototype chain,
			&& Object.propertyIsEnumerable.call(target, key)) // and also unsafe if they're nonenumerable.
}

const mergeObject = (target, source, options) => {
	const destination = {}

	if (options.isMergeable(target)) {
		getKeys(target)
			.forEach(key => destination[key] = cloneUnlessOtherwiseSpecified(target[key], options))
	}

	getKeys(source).forEach(key => {
		if (propertyIsUnsafe(target, key)) {
			return
		}

		if (propertyIsOnObject(target, key) && options.isMergeable(source[key])) {
			destination[key] = getMergeFunction(key, options)(target[key], source[key], options)
		} else {
			destination[key] = cloneUnlessOtherwiseSpecified(source[key], options)
		}
	})

	return destination
}

const deepmerge = (target, source, inputOptions) => {
	const options = {
		arrayMerge: defaultArrayMerge,
		isMergeable: defaultIsMergeable,
		...inputOptions,
		// cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
		// implementations can use it. The caller may not replace it.
		cloneUnlessOtherwiseSpecified: cloneUnlessOtherwiseSpecified
	}

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

deepmerge.all = (array, options) => {
	if (!Array.isArray(array)) {
		throw new Error(`first argument should be an array`)
	}

	return array.reduce((prev, next) => deepmerge(prev, next, options), {})
}

module.exports = deepmerge
