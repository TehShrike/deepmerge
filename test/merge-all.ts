import { deepmergeAll as mergeAll } from "deepmerge"
import test from "tape"

test('throw error if first argument is not an array', function(t) {
	// @ts-expect-error
	t.throws(mergeAll.bind(null, { example: true }, { another: '2' }), Error)
	t.end()
})

test('return an empty object if first argument is an array with no elements', function(t) {
	t.deepEqual(mergeAll([]), {})
	t.end()
})

test('Work just fine if first argument is an array with least than two elements', function(t) {
	var actual = mergeAll([{ example: true }])
	var expected = { example: true }
	t.deepEqual(actual, expected)
	t.end()
})

test('execute correctly if options object were not passed', function(t) {
	var arrayToMerge = [{ example: true }, { another: '123' }]
	t.doesNotThrow(mergeAll.bind(null, arrayToMerge))
	t.end()
})

test('execute correctly if options object were passed', function(t) {
	var arrayToMerge = [{ example: true }, { another: '123' }]
	t.doesNotThrow(mergeAll.bind(null, arrayToMerge, { clone: true }))
	t.end()
})

test('invoke merge on every item in array should result with all props', function(t) {
	var firstObject = { first: true }
	var secondObject = { second: false }
	var thirdObject = { third: 123 }
	var fourthObject = { fourth: 'some string' }

	var mergedObject = mergeAll([ firstObject, secondObject, thirdObject, fourthObject ])

	t.ok(mergedObject.first === true)
	t.ok(mergedObject.second === false)
	t.ok(mergedObject.third === 123)
	t.ok(mergedObject.fourth === 'some string')
	t.end()
})

test('invoke merge on every item in array with clone should clone all elements', function(t) {
	var firstObject = { a: { d: 123 } }
	var secondObject = { b: { e: true } }
	var thirdObject = { c: { f: 'string' } }

	var mergedWithClone = mergeAll([ firstObject, secondObject, thirdObject ], { clone: true })

	t.notEqual(mergedWithClone.a, firstObject.a)
	t.notEqual(mergedWithClone.b, secondObject.b)
	t.notEqual(mergedWithClone.c, thirdObject.c)

	t.end()
})

test('invoke merge on every item in array clone=false should not clone all elements', function(t) {
	var firstObject = { a: { d: 123 } }
	var secondObject = { b: { e: true } }
	var thirdObject = { c: { f: 'string' } }

	var mergedWithoutClone = mergeAll([ firstObject, secondObject, thirdObject ], { clone: false })

	t.equal(mergedWithoutClone.a, firstObject.a)
	t.equal(mergedWithoutClone.b, secondObject.b)
	t.equal(mergedWithoutClone.c, thirdObject.c)

	t.end()
})


test('invoke merge on every item in array without clone should clone all elements', function(t) {
	var firstObject = { a: { d: 123 } }
	var secondObject = { b: { e: true } }
	var thirdObject = { c: { f: 'string' } }

	var mergedWithoutClone = mergeAll([ firstObject, secondObject, thirdObject ])

	t.notEqual(mergedWithoutClone.a, firstObject.a)
	t.notEqual(mergedWithoutClone.b, secondObject.b)
	t.notEqual(mergedWithoutClone.c, thirdObject.c)

	t.end()
})

test('With clone: false, mergeAll should not clone the target root', t => {
	const destination = {}
	const output = mergeAll([
		destination, {
			sup: true
		}
	], { clone: false })

	t.equal(destination, output)
	t.end()
})
