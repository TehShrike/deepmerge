import type { Options } from "deepmerge"
import deepmerge from "deepmerge"
import test from "tape"

test(`custom merge array`, (t) => {
	let mergeFunctionCalled = false
	const overwriteMerge: Options[`arrayMerge`] = (target, source, options) => {
		mergeFunctionCalled = true
		t.equal(options.arrayMerge, overwriteMerge)

		return source
	}
	const destination = {
		someArray: [ 1, 2 ],
		someObject: { what: `yes` },
	}
	const source = {
		someArray: [ 1, 2, 3 ],
	}

	const actual = deepmerge(destination, source, { arrayMerge: overwriteMerge })
	const expected = {
		someArray: [ 1, 2, 3 ],
		someObject: { what: `yes` },
	}

	t.ok(mergeFunctionCalled)
	t.deepEqual(actual, expected)
	t.end()
})

test(`merge top-level arrays`, (t) => {
	const overwriteMerge: Options[`arrayMerge`] = (a, b) => b
	const actual = deepmerge([ 1, 2 ], [ 1, 2 ], { arrayMerge: overwriteMerge })
	const expected = [ 1, 2 ]

	t.deepEqual(actual, expected)
	t.end()
})

test(`cloner function is available for merge functions to use`, (t) => {
	let customMergeWasCalled = false
	const cloneMerge: Options[`arrayMerge`] = (target, source, options) => {
		customMergeWasCalled = true
		t.ok(options.cloneUnlessOtherwiseSpecified, `cloner function is available`)
		return target.concat(source).map((element) => options.cloneUnlessOtherwiseSpecified(element, options))
	}

	const src = {
		key1: [ `one`, `three` ],
		key2: [ `four` ],
	}
	const target = {
		key1: [ `one`, `two` ],
	}

	const expected = {
		key1: [ `one`, `two`, `one`, `three` ],
		key2: [ `four` ],
	}

	t.deepEqual(deepmerge(target, src, { arrayMerge: cloneMerge }), expected)
	t.ok(customMergeWasCalled)
	t.ok(Array.isArray(deepmerge(target, src).key1))
	t.ok(Array.isArray(deepmerge(target, src).key2))
	t.end()
})
