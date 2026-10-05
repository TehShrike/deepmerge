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

test('preserving an own __proto__ data property from a null-prototype source', function(t) {
	var target = Object.create(null)
	var source = JSON.parse('{ "__proto__": { "admin": true } }')
	var mergedObject = merge(target, source)

	t.equal(Object.getPrototypeOf(mergedObject), Object.prototype, 'the destination should keep the default prototype')
	t.equal(mergedObject.__proto__.admin, true, 'the own data property should be preserved')
	t.notEqual(mergedObject.__proto__, source.__proto__, 'the own data property should be cloned')
	t.notOk(mergedObject.admin, 'the own data property should not become the destination prototype')
	t.end()
})

test('preserving an own __proto__ data property from a null-prototype target', function(t) {
	var target = Object.create(null)
	var proto = { admin: true }
	Object.defineProperty(target, '__proto__', {
		value: proto,
		enumerable: true,
		writable: true,
		configurable: true
	})

	var mergedObject = merge(target, {})

	t.equal(Object.getPrototypeOf(mergedObject), Object.prototype, 'the destination should keep the default prototype')
	t.equal(mergedObject.__proto__.admin, true, 'the own data property should be preserved')
	t.notEqual(mergedObject.__proto__, proto, 'the own data property should be cloned')
	t.notOk(mergedObject.admin, 'the own data property should not become the destination prototype')
	t.end()
})

test('preserving an own __proto__ data property through a null placeholder', function(t) {
	var target = { session: null }
	var proto = { admin: true }
	var source = { session: Object.create(null) }
	Object.defineProperty(source.session, '__proto__', {
		value: proto,
		enumerable: true,
		writable: true,
		configurable: true
	})

	var mergedObject = merge(target, source)

	t.equal(Object.getPrototypeOf(mergedObject.session), Object.prototype, 'the nested destination should keep the default prototype')
	t.equal(mergedObject.session.__proto__.admin, true, 'the nested own data property should be preserved')
	t.notEqual(mergedObject.session.__proto__, proto, 'the nested own data property should be cloned')
	t.notOk(mergedObject.session.admin, 'the nested own data property should not become the nested prototype')
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
