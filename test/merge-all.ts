import { deepmergeAll as mergeAll } from "deepmerge"
import test from "tape"

test(`throw error if first argument is not an array`, (t) => {
	// @ts-expect-error -- Calling mergeAll without passing in an array.
	t.throws(mergeAll.bind(null, { example: true }, { another: `2` }), Error)
	t.end()
})

test(`return an empty object if first argument is an array with no elements`, (t) => {
	t.deepEqual(mergeAll([]), {})
	t.end()
})

test(`Work just fine if first argument is an array with least than two elements`, (t) => {
	const actual = mergeAll([{ example: true }])
	const expected = { example: true }
	t.deepEqual(actual, expected)
	t.end()
})

test(`execute correctly if options object were not passed`, (t) => {
	const arrayToMerge = [{ example: true }, { another: `123` }]
	t.doesNotThrow(mergeAll.bind(null, arrayToMerge))
	t.end()
})

test(`execute correctly if options object were passed`, (t) => {
	const arrayToMerge = [{ example: true }, { another: `123` }]
	t.doesNotThrow(mergeAll.bind(null, arrayToMerge, { clone: true }))
	t.end()
})

test(`invoke merge on every item in array should result with all props`, (t) => {
	const firstObject = { first: true }
	const secondObject = { second: false }
	const thirdObject = { third: 123 }
	const fourthObject = { fourth: `some string` }

	const mergedObject = mergeAll([ firstObject, secondObject, thirdObject, fourthObject ])

	t.ok(mergedObject.first === true)
	t.ok(mergedObject.second === false)
	t.ok(mergedObject.third === 123)
	t.ok(mergedObject.fourth === `some string`)
	t.end()
})

test(`invoke merge on every item in array with clone should clone all elements`, (t) => {
	const firstObject = { a: { d: 123 } }
	const secondObject = { b: { e: true } }
	const thirdObject = { c: { f: `string` } }

	const mergedWithClone = mergeAll([ firstObject, secondObject, thirdObject ], { clone: true })

	t.notEqual(mergedWithClone.a, firstObject.a)
	t.notEqual(mergedWithClone.b, secondObject.b)
	t.notEqual(mergedWithClone.c, thirdObject.c)

	t.end()
})

test(`invoke merge on every item in array clone=false should not clone all elements`, (t) => {
	const firstObject = { a: { d: 123 } }
	const secondObject = { b: { e: true } }
	const thirdObject = { c: { f: `string` } }

	const mergedWithoutClone = mergeAll([ firstObject, secondObject, thirdObject ], { clone: false })

	t.equal(mergedWithoutClone.a, firstObject.a)
	t.equal(mergedWithoutClone.b, secondObject.b)
	t.equal(mergedWithoutClone.c, thirdObject.c)

	t.end()
})


test(`invoke merge on every item in array without clone should clone all elements`, (t) => {
	const firstObject = { a: { d: 123 } }
	const secondObject = { b: { e: true } }
	const thirdObject = { c: { f: `string` } }

	const mergedWithoutClone = mergeAll([ firstObject, secondObject, thirdObject ])

	t.notEqual(mergedWithoutClone.a, firstObject.a)
	t.notEqual(mergedWithoutClone.b, secondObject.b)
	t.notEqual(mergedWithoutClone.c, thirdObject.c)

	t.end()
})

test(`With clone: false, mergeAll should not clone the target root`, (t) => {
	const destination = {}
	const output = mergeAll([
		destination, {
			sup: true,
		},
	], { clone: false })

	t.equal(destination, output)
	t.end()
})
