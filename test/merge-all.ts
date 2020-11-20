import { deepmergeAll } from "deepmerge"
import test from "tape"

test(`throw error if first argument is not an array`, (t) => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error -- FIXME: Can't use @ts-expect-error due to it failing in tests.
	// @ts-ignore Expect a type error when calling the function incorrectly.
	t.throws(deepmergeAll.bind(null, { example: true }, { another: `2` }), TypeError)
	t.end()
})

test(`return an empty object if first argument is an array with no elements`, (t) => {
	t.deepEqual(deepmergeAll([]), {})
	t.end()
})

test(`Work just fine if first argument is an array with least than two elements`, (t) => {
	const actual = deepmergeAll([{ example: true }])
	const expected = { example: true }
	t.deepEqual(actual, expected)
	t.end()
})

test(`execute correctly if options object were not passed`, (t) => {
	const arrayToMerge = [{ example: true }, { another: `123` }]
	t.doesNotThrow(deepmergeAll.bind(null, arrayToMerge))
	t.end()
})

test(`execute correctly if options object were passed`, (t) => {
	const arrayToMerge = [{ example: true }, { another: `123` }]
	t.doesNotThrow(deepmergeAll.bind(null, arrayToMerge, { clone: true }))
	t.end()
})

test(`invoke merge on every item in array should result with all props`, (t) => {
	const firstObject = { first: true }
	const secondObject = { second: false }
	const thirdObject = { third: 123 }
	const fourthObject = { fourth: `some string` }

	const mergedObject = deepmergeAll([ firstObject, secondObject, thirdObject, fourthObject ])

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

	const mergedWithClone = deepmergeAll([ firstObject, secondObject, thirdObject ], { clone: true })

	t.notEqual(mergedWithClone.a, firstObject.a)
	t.notEqual(mergedWithClone.b, secondObject.b)
	t.notEqual(mergedWithClone.c, thirdObject.c)

	t.end()
})

test(`invoke merge on every item in array clone=false should not clone all elements`, (t) => {
	const firstObject = { a: { d: 123 } }
	const secondObject = { b: { e: true } }
	const thirdObject = { c: { f: `string` } }

	const mergedWithoutClone = deepmergeAll([ firstObject, secondObject, thirdObject ], { clone: false })

	t.equal(mergedWithoutClone.a, firstObject.a)
	t.equal(mergedWithoutClone.b, secondObject.b)
	t.equal(mergedWithoutClone.c, thirdObject.c)

	t.end()
})


test(`invoke merge on every item in array without clone should clone all elements`, (t) => {
	const firstObject = { a: { d: 123 } }
	const secondObject = { b: { e: true } }
	const thirdObject = { c: { f: `string` } }

	const mergedWithoutClone = deepmergeAll([ firstObject, secondObject, thirdObject ])

	t.notEqual(mergedWithoutClone.a, firstObject.a)
	t.notEqual(mergedWithoutClone.b, secondObject.b)
	t.notEqual(mergedWithoutClone.c, thirdObject.c)

	t.end()
})
