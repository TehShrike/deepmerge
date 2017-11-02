var merge = require('../')
var test = require('tap').test

test('custom merge array', function(t) {
	var mergeFunctionCalled = false
	function overwriteMerge(target, source, options) {
		mergeFunctionCalled = true
		t.equal(options.objectMerge, overwriteMerge)

		var isEmptyObject = !Object.keys(source).length
		return isEmptyObject ? {} : options.nativeObjectMerge(target, source, options)
	}
	const destination = {
		someArray: [ 1, 2 ],
		someObject: { what: 'yes' },
		someObjectOverwrite: { that: 'no' }
	}
	const source = {
		someArray: [ 1, 2, 3 ],
		someObjectOverwrite: {}
	}

	const actual = merge(destination, source, { objectMerge: overwriteMerge })
	const expected = {
		someArray: [ 1, 2, 1, 2, 3 ],
		someObject: { what: 'yes' },
		someObjectOverwrite: {}
	}

	t.ok(mergeFunctionCalled)
	t.deepEqual(actual, expected)
	t.end()
})
