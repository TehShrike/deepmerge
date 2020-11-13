import isPlainObj from 'is-plain-obj'
import {
	cloneUnlessOtherwiseSpecified,
	getKeys,
	getMergeFunction,
	propertyIsOnObject,
	propertyIsUnsafe
} from './utils'

function defaultIsMergeable(value) {
	return Array.isArray(value) || isPlainObj(value)
}

function defaultArrayMerge(target, source, options) {
	return target.concat(source).map((element) =>
		cloneUnlessOtherwiseSpecified(element, options)
	)
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

export function deepmergeImpl(target, source, options) {
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
