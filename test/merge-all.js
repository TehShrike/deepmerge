var merge = require('../')
var test = require('tape')

test('throw error if first argument is not an array', function(t) {
	t.throws(merge.all.bind(null, { example: true }, { another: '2' }), Error)
	t.end()
})

test('return an empty object if first argument is an array with no elements', function(t) {
	t.deepEqual(merge.all([]), {})
	t.end()
})

test('Work just fine if first argument is an array with least than two elements', function(t) {
	var actual = merge.all([{ example: true }])
	var expected = { example: true }
	t.deepEqual(actual, expected)
	t.end()
})

test('execute correctly if options object were not passed', function(t) {
	var arrayToMerge = [{ example: true }, { another: '123' }]
	t.doesNotThrow(merge.all.bind(null, arrayToMerge))
	t.end()
})

test('execute correctly if options object were passed', function(t) {
	var arrayToMerge = [{ example: true }, { another: '123' }]
	t.doesNotThrow(merge.all.bind(null, arrayToMerge, { clone: true }))
	t.end()
})

test('invoke merge on every item in array should result with all props', function(t) {
	var firstObject = { first: true }
	var secondObject = { second: false }
	var thirdObject = { third: 123 }
	var fourthObject = { fourth: 'some string' }

	var mergedObject = merge.all([ firstObject, secondObject, thirdObject, fourthObject ])

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

	var mergedWithClone = merge.all([ firstObject, secondObject, thirdObject ], { clone: true })

	t.notEqual(mergedWithClone.a, firstObject.a)
	t.notEqual(mergedWithClone.b, secondObject.b)
	t.notEqual(mergedWithClone.c, thirdObject.c)

	t.end()
})

test('invoke merge on every item in array clone=false should not clone all elements', function(t) {
	var firstObject = { a: { d: 123 } }
	var secondObject = { b: { e: true } }
	var thirdObject = { c: { f: 'string' } }

	var mergedWithoutClone = merge.all([ firstObject, secondObject, thirdObject ], { clone: false })

	t.equal(mergedWithoutClone.a, firstObject.a)
	t.equal(mergedWithoutClone.b, secondObject.b)
	t.equal(mergedWithoutClone.c, thirdObject.c)

	t.end()
})


test('invoke merge on every item in array without clone should clone all elements', function(t) {
	var firstObject = { a: { d: 123 } }
	var secondObject = { b: { e: true } }
	var thirdObject = { c: { f: 'string' } }

	var mergedWithoutClone = merge.all([ firstObject, secondObject, thirdObject ])

	t.notEqual(mergedWithoutClone.a, firstObject.a)
	t.notEqual(mergedWithoutClone.b, secondObject.b)
	t.notEqual(mergedWithoutClone.c, thirdObject.c)

	t.end()
})

test('merge.all matches repeated merges', function(t) {
	var items = []
	for (var i = 0; i < 1000; i++) {
		var item = { messages: {}, list: [ { index: i } ] }
		item.messages['key' + i] = { text: 'message ' + i }
		item['top' + (i % 10)] = { count: i, when: new Date(i) }
		items.push(item)
	}

	var expected = items.reduce(function(prev, next) {
		return merge(prev, next)
	}, {})
	var actual = merge.all(items)

	t.deepEqual(actual, expected)
	t.equal(Object.keys(actual.messages).length, 1000)
	t.equal(actual.list.length, 1000)
	t.deepEqual(actual.top3, { count: 993, when: new Date(993) })
	t.end()
})

test('merge.all clones its inputs', function(t) {
	var first = { a: { b: [ { c: 1 } ] } }
	var second = { a: { b: [ { d: 2 } ], e: { f: 3 } } }
	var third = { a: { e: { g: 4 } } }

	var merged = merge.all([ first, second, third ])

	t.deepEqual(merged, { a: { b: [ { c: 1 }, { d: 2 } ], e: { f: 3, g: 4 } } })
	t.deepEqual(first, { a: { b: [ { c: 1 } ] } })
	t.deepEqual(second, { a: { b: [ { d: 2 } ], e: { f: 3 } } })
	t.deepEqual(third, { a: { e: { g: 4 } } })
	t.notEqual(merged.a.b[0], first.a.b[0])
	t.notEqual(merged.a.b[1], second.a.b[0])
	t.notEqual(merged.a.e, second.a.e)

	merged.a.e.f = 'changed'
	merged.a.b[0].c = 'changed'
	t.equal(second.a.e.f, 3)
	t.equal(first.a.b[0].c, 1)
	t.end()
})

test('merge.all preserves array holes', function(t) {
	var first = new Array(2)
	first[1] = { a: 1 }
	var second = new Array(3)
	second[1] = { b: 2 }
	var result = merge.all([ first, second, [ { c: 3 } ] ])

	t.equal(result.length, 6)
	t.notOk(0 in result)
	t.notOk(2 in result)
	t.notOk(4 in result)
	t.deepEqual(result[3], { b: 2 })
	t.notEqual(result[1], first[1])
	t.notEqual(result[3], second[1])
	t.equal(first.length, 2)
	t.end()
})

test('merge.all skips holes in its input', function(t) {
	var items = new Array(3)
	items[1] = { a: 1 }
	items[2] = { b: 2 }

	t.deepEqual(merge.all(items), { a: 1, b: 2 })
	t.end()
})

test('merge.all preserves custom predicate calls', function(t) {
	var calls = 0
	var options = {
		isMergeableObject: function(value) {
			calls++
			return value !== null && typeof value === 'object'
		},
	}
	var items = [ { a: { b: 1 } }, { c: 2 }, { d: 3 } ]
	var expected = items.reduce(function(prev, next) {
		return merge(prev, next, options)
	}, {})
	var expectedCalls = calls
	calls = 0

	t.deepEqual(merge.all(items, options), expected)
	t.equal(calls, expectedCalls)
	t.end()
})

test('merge.all matches repeated merges with reused options', function(t) {
	var options = {}
	merge({}, {}, options)
	var items = [ { a: [ 1 ] }, { a: [ 2 ], b: { c: 1 } }, { b: { d: 2 } } ]
	var expected = items.reduce(function(prev, next) {
		return merge(prev, next, options)
	}, {})

	t.deepEqual(merge.all(items, options), expected)
	t.end()
})
