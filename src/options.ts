import isPlainObj from "is-plain-obj"

import { cloneUnlessOtherwiseSpecified } from "./utils"

export function defaultIsMergeable(value) {
	return Array.isArray(value) || isPlainObj(value)
}

export function defaultArrayMerge(target, source, options) {
	return target
		.concat(source)
		.map((element) => cloneUnlessOtherwiseSpecified(element, options))
}
