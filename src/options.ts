import isPlainObj from "is-plain-obj"

import { cloneUnlessOtherwiseSpecified } from "./utils"

function defaultIsMergeable(value) {
	return Array.isArray(value) || isPlainObj(value)
}

function defaultArrayMerge(target, source, options) {
	return [...target, ...source].map((element) =>
		cloneUnlessOtherwiseSpecified(element, options)
	)
}

export function getFullOptions(options) {
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
