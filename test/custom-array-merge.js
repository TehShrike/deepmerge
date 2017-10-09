var merge = require('../')
var test = require('tap').test

test('custom merge array', function(t) {
	var mergeFunctionCalled = false
	function overwriteMerge(target, source, options) {
		mergeFunctionCalled = true
		t.equal(options.arrayMerge, overwriteMerge)

		return source
	}
	const destination = {
		someArray: [ 1, 2 ],
		someObject: { what: 'yes' },
	}
	const source = {
		someArray: [ 1, 2, 3 ],
	}

	const actual = merge(destination, source, { arrayMerge: overwriteMerge })
	const expected = {
		someArray: [ 1, 2, 3 ],
		someObject: { what: 'yes' },
	}

	t.ok(mergeFunctionCalled)
	t.deepEqual(actual, expected)
	t.end()
})

test('merge top-level arrays', function(t) {
	function overwriteMerge(a, b) {
		return b
	}
	var actual = merge([ 1, 2 ], [ 1, 2 ], { arrayMerge: overwriteMerge })
	var expected = [ 1, 2 ]

	t.deepEqual(actual, expected)
	t.end()
})
