var merge = require('../')
var test = require('tap').test

test('custom merge array', function(t) {
	var mergeFunctionCalled = false
	function concatMerge(target, source, options) {
		t.notOk(mergeFunctionCalled)
		mergeFunctionCalled = true

		t.deepEqual(target, [1, 2])
		t.deepEqual(source, [1, 2, 3])
		t.equal(options.arrayMerge, concatMerge)

		return target.concat(source)
	}
	const destination = {
		someArray: [1, 2],
		someObject: { what: 'yes' }
	}
	const source = {
		someArray: [1, 2, 3]
	}

	const actual = merge(destination, source, { arrayMerge: concatMerge })
	const expected = {
		someArray: [1, 2, 1, 2, 3],
		someObject: { what: 'yes' }
	}

	t.ok(mergeFunctionCalled)
	t.deepEqual(actual, expected)
	t.end()
})

test('merge top-level arrays', function(t) {
	function concatMerge(a, b) {
		return a.concat(b)
	}
	var actual = merge([1, 2], [1, 2], { arrayMerge: concatMerge })
	var expected = [1, 2, 1, 2]

	t.deepEqual(actual, expected)
	t.end()
})
