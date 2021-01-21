import isPlainObj from "is-plain-obj"

import { cloneUnlessOtherwiseSpecified } from "./utils"

function defaultIsMergeable(value) {
	return Array.isArray(value) || isPlainObj(value)
}

function defaultArrayMerge(target, source, options) {
	return target
		.concat(source)
		.map((element) => cloneUnlessOtherwiseSpecified(element, options))
}

export function getFullOptions(inputOptions) {
	const overrides = inputOptions === undefined
		? undefined
		: Object.fromEntries(
			// Filter out keys explicitly set to undefined.
			Object.entries(inputOptions).filter(
				([ _key, value ]) => value !== undefined,
			),
		)

	return {
		arrayMerge: defaultArrayMerge,
		isMergeable: defaultIsMergeable,
		clone: false,
		...overrides,
		// cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
		// implementations can use it. The caller may not replace it.
		cloneUnlessOtherwiseSpecified,
	}
}
