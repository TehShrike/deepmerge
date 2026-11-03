var merge = require('../')
var test = require('tape')
var isMergeableObject = require('is-mergeable-object')

test('merging objects with own __proto__', function(t) {
	var user = {}
	var malicious = JSON.parse('{ "__proto__": { "admin": true } }')
	var mergedObject = merge(user, malicious)
	t.notOk(mergedObject.__proto__.admin, 'non-plain properties should not be merged')
	t.notOk(mergedObject.admin, 'the destination should have an unmodified prototype')
	t.end()
})

test('merging objects with plain and non-plain properties', function(t) {
	var plainSymbolKey = Symbol('plainSymbolKey')
	var parent = {
		parentKey: 'should be undefined'
	}
	
	var target = Object.create(parent)	
	target.plainKey = 'should be replaced'
	target[plainSymbolKey] = 'should also be replaced'
	
	var source = {
		parentKey: 'foo',
		plainKey: 'bar',
		newKey: 'baz',
		[plainSymbolKey]: 'qux'
	}
	
	var mergedObject = merge(target, source)
	t.equal(undefined, mergedObject.parentKey, 'inherited properties of target should be removed, not merged or ignored')
	t.equal('bar', mergedObject.plainKey, 'enumerable own properties of target should be merged')
	t.equal('baz', mergedObject.newKey, 'properties not yet on target should be merged')
	t.equal('qux', mergedObject[plainSymbolKey], 'enumerable own symbol properties of target should be merged')
	t.end()
})

// the following cases come from the thread here: https://github.com/TehShrike/deepmerge/pull/164
test('merging strings works with a custom string merge', function(t) {
	var target = { name: "Alexander" }
	var source = { name: "Hamilton" }
	function customMerge(key, options) {
		if (key === 'name') {
			return function(target, source, options) {
				return target[0] + '. ' + source.substring(0, 3)
			}
		} else {
			return merge
		}
	}

	function mergeable(target) {
		return isMergeableObject(target) || (typeof target === 'string' && target.length > 1)
	}

	t.equal('A. Ham', merge(target, source, { customMerge: customMerge, isMergeableObject: mergeable }).name)
	t.end()
})

test('merging objects with null prototype', function(t) {
	var target = Object.create(null)
	var source = Object.create(null)
	target.wheels = 4
	target.trunk = { toolbox: ['hammer'] }
	source.trunk = { toolbox: ['wrench'] }
	source.engine = 'v8'
	var expected = {
		wheels: 4,
		engine: 'v8',
		trunk: {
			toolbox: ['hammer', 'wrench' ]
		}
	}

	t.deepEqual(expected, merge(target, source))
	t.end()
})

test('merge.all matches repeated merges for __proto__', function(t) {
	var items = [
		{ user: null },
		JSON.parse('{ "user": { "__proto__": { "admin": true } } }'),
		{ other: true },
	]
	var expected = items.reduce(function(prev, next) {
		return merge(prev, next)
	}, {})
	var mergedObject = merge.all(items)

	t.notOk(mergedObject.user.admin, 'the merged object should not inherit from __proto__')
	t.equal(Object.getPrototypeOf(mergedObject.user), Object.getPrototypeOf(expected.user))
	t.deepEqual(mergedObject, expected)
	t.end()
})

test('merge.all matches repeated merges for constructor', function(t) {
	var items = [
		{ settings: null },
		{ settings: { constructor: 'value', other: 'value' } },
		{ more: true },
	]
	var expected = items.reduce(function(prev, next) {
		return merge(prev, next)
	}, {})

	t.deepEqual(merge.all(items), expected)
	t.end()
})
