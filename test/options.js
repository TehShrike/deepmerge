var merge = require('../')
var test = require('tape')

test('does not modify the caller options', function(t) {
	var options = { clone: true }

	t.deepEqual(merge({ a: 1 }, { b: 2 }, options), { a: 1, b: 2 })
	t.deepEqual(options, { clone: true })
	t.end()
})

test('accepts frozen options when merging nested objects and arrays', function(t) {
	var source = { nested: { b: 2 }, list: [{ value: 3 }] }
	var options = Object.freeze({ clone: true })
	var actual = merge({ nested: { a: 1 }, list: [1] }, source, options)

	t.deepEqual(actual, { nested: { a: 1, b: 2 }, list: [1, { value: 3 }] })
	t.notEqual(actual.nested, source.nested)
	t.notEqual(actual.list[1], source.list[0])
	t.deepEqual(merge({}, { value: 1 }, Object.freeze({})), { value: 1 })
	t.end()
})

test('accepts frozen options for merge.all and clone false', function(t) {
	var source = { nested: { value: 1 } }
	var options = Object.freeze({ clone: false })
	var actual = merge.all([{ a: 1 }, source, { b: 2 }], options)

	t.deepEqual(actual, { a: 1, nested: { value: 1 }, b: 2 })
	t.equal(actual.nested, source.nested)
	t.end()
})

test('preserves custom options and helpers for frozen array merge options', function(t) {
	var source = [{ value: 1 }]
	var customValue = {}
	var options = Object.freeze({
		customValue: customValue,
		arrayMerge: function(target, source, mergeOptions) {
			t.equal(mergeOptions.customValue, customValue)
			t.equal(mergeOptions.arrayMerge, options.arrayMerge)
			t.ok(mergeOptions.isMergeableObject(source))
			return source.map(function(value) {
				return mergeOptions.cloneUnlessOtherwiseSpecified(value, mergeOptions)
			})
		},
		cloneUnlessOtherwiseSpecified: function() {
			t.fail('the caller may not replace the internal clone helper')
		},
	})
	var actual = merge([], source, options)

	t.deepEqual(actual, source)
	t.notEqual(actual[0], source[0])
	t.end()
})

test('preserves customMerge and isMergeableObject in frozen options', function(t) {
	var options = Object.freeze({
		isMergeableObject: function(value) {
			return value !== null && typeof value === 'object'
		},
		customMerge: function(key) {
			if (key === 'nested') {
				return function(target, source) {
					return { value: target.value + source.value }
				}
			}
		},
	})

	t.deepEqual(merge({ nested: { value: 1 } }, { nested: { value: 2 } }, options), {
		nested: { value: 3 },
	})
	t.end()
})

test('preserves inherited and non-enumerable options', function(t) {
	var child = { value: 1 }
	var inheritedOptions = Object.freeze(Object.create(Object.freeze({ clone: false })))
	t.equal(merge({}, { child: child }, inheritedOptions).child, child)

	var hiddenOptions = Object.freeze(Object.defineProperty({}, 'arrayMerge', {
		value: function(target, source) {
			return source
		},
	}))
	var source = [child]
	t.equal(merge([], source, hiddenOptions), source)
	t.end()
})

test('shares resolved options throughout a recursive merge', function(t) {
	var arrayOptions
	var customOptions
	var options = Object.freeze({
		arrayMerge: function(target, source, mergeOptions) {
			arrayOptions = mergeOptions
			return source
		},
		customMerge: function(key) {
			if (key === 'child') {
				return function(target, source, mergeOptions) {
					customOptions = mergeOptions
					return source
				}
			}
		},
	})

	merge({ nested: { child: {} } }, { list: [], nested: { child: {} } }, options)
	t.equal(arrayOptions, customOptions)
	t.end()
})

test('the public clone helper resolves defaults for modified options', function(t) {
	var source = [[{ value: 1 }]]
	var actual = merge([], source, {
		arrayMerge: function(target, source, options) {
			var cloneOptions = { isMergeableObject: options.isMergeableObject }
			return options.cloneUnlessOtherwiseSpecified(source, cloneOptions)
		},
	})

	t.deepEqual(actual, source)
	t.notEqual(actual[0], source[0])
	t.notEqual(actual[0][0], source[0][0])
	t.end()
})

test('callbacks can copy the clone option before using the public helper', function(t) {
	var source = [{ value: 1 }]
	var actual = merge([], source, {
		clone: false,
		arrayMerge: function(target, source, options) {
			var cloneOptions = {}
			Object.keys(options).forEach(function(key) {
				cloneOptions[key] = options[key]
			})
			cloneOptions.arrayMerge = undefined
			return options.cloneUnlessOtherwiseSpecified(source, cloneOptions)
		},
	})

	t.equal(actual, source)
	t.end()
})

test('callbacks can copy custom merge configuration before merging', function(t) {
	var actual = merge([{ child: {} }], [{ child: {} }], {
		customValue: 'merged',
		customMerge: function(key) {
			if (key === 'child') {
				return function(target, source, options) {
					return options.customValue
				}
			}
		},
		arrayMerge: function(target, source, options) {
			var mergeOptions = {}
			Object.keys(options).forEach(function(key) {
				mergeOptions[key] = options[key]
			})
			return merge(target[0], source[0], mergeOptions)
		},
	})

	t.deepEqual(actual, { child: 'merged' })
	t.end()
})

test('preserves own custom option descriptors and the original prototype', function(t) {
	var symbol = Symbol('custom option')
	var prototype = { inherited: 'inherited option' }
	var options = Object.create(prototype)
	Object.defineProperty(options, 'hidden', { value: 'hidden option' })
	Object.defineProperty(options, symbol, { value: 'symbol option' })
	Object.defineProperty(options, '__proto__', { value: 'literal option' })
	options.arrayMerge = function(target, source, mergeOptions) {
		t.equal(Object.getPrototypeOf(mergeOptions), prototype)
		var keys = ['hidden', symbol, '__proto__']
		keys.forEach(function(key) {
			t.deepEqual(Object.getOwnPropertyDescriptor(mergeOptions, key),
				Object.getOwnPropertyDescriptor(options, key))
		})
		return source
	}

	merge([], [], Object.freeze(options))
	t.end()
})
