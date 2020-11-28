import type { Options } from "deepmerge"
import deepmerge from "deepmerge"
import test from "tape"

test(`custom clone is called`, (t) => {
	let cloneFunctionCallCount = 0
	const overwriteClone: Options[`clone`] = (value, options) => {
		cloneFunctionCallCount++
		t.equal(options.clone, overwriteClone)

		return value
	}

	const source = {
		someArray: [ 1, 2 ],
		someObject: { what: `yes` },
	}

	const actual = deepmerge({}, source, { clone: overwriteClone })
	const expected = {
		someArray: source.someArray,
		someObject: source.someObject,
	}

	t.equal(cloneFunctionCallCount, 2)
	t.deepEqual(actual, expected)
	t.equal(actual.someArray, expected.someArray)
	t.equal(actual.someObject, expected.someObject)

	t.end()
})

test(`custom clone can replicate default clone`, (t) => {
	const overwriteClone: Options[`clone`] = (value, options) => options.deepClone(value)

	const source = {
		someArray: [ 1, 2 ],
		someObject: { what: `yes` },
	}

	const actual = deepmerge({}, source, { clone: overwriteClone })
	const expected = {
		someArray: source.someArray,
		someObject: source.someObject,
	}

	t.deepEqual(actual, expected)
	t.notEqual(actual.someArray, expected.someArray)
	t.notEqual(actual.someObject, expected.someObject)

	t.end()
})
