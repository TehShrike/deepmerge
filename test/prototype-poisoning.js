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

// the following cases come from https://github.com/TehShrike/deepmerge/issues/273
test('merging a __proto__ key into a null-prototype target', function(t) {
	var defaults = Object.create(null)
	defaults.debug = false
	var malicious = JSON.parse('{ "__proto__": { "isAdmin": true } }')
	var mergedObject = merge(defaults, malicious)
	t.equal(Object.getPrototypeOf(mergedObject), Object.prototype, 'the destination should keep the default prototype')
	t.notOk(mergedObject.isAdmin, 'the destination should not inherit attacker-controlled properties')
	t.equal(mergedObject.debug, false, 'legitimate target properties should still be merged')
	t.end()
})

test('merging a __proto__ key into a null placeholder on the target', function(t) {
	var defaults = { session: null }
	var malicious = JSON.parse('{ "session": { "__proto__": { "isAdmin": true } } }')
	var mergedObject = merge(defaults, malicious)
	t.equal(Object.getPrototypeOf(mergedObject.session), Object.prototype, 'the nested destination should keep the default prototype')
	t.notOk(mergedObject.session.isAdmin, 'the nested destination should not inherit attacker-controlled properties')
	t.end()
})

test('merging when the target has an own __proto__ key', function(t) {
	var poisonedTarget = JSON.parse('{ "__proto__": { "isAdmin": true }, "debug": false }')
	var mergedObject = merge(poisonedTarget, { verbose: true })
	t.equal(Object.getPrototypeOf(mergedObject), Object.prototype, 'the destination should keep the default prototype')
	t.notOk(mergedObject.isAdmin, 'an own __proto__ key on the target should not be copied')
	t.notOk(Object.prototype.hasOwnProperty.call(mergedObject, '__proto__'), 'the destination should not have an own __proto__ key')
	t.equal(mergedObject.debug, false, 'other target properties should still be merged')
	t.equal(mergedObject.verbose, true, 'source properties should still be merged')
	t.end()
})

test('merging a __proto__ key nested inside an array element', function(t) {
	var defaults = { list: [] }
	var malicious = JSON.parse('{ "list": [ { "__proto__": { "isAdmin": true } } ] }')
	var mergedObject = merge(defaults, malicious)
	t.equal(Object.getPrototypeOf(mergedObject.list[0]), Object.prototype, 'cloned array elements should keep the default prototype')
	t.notOk(mergedObject.list[0].isAdmin, 'cloned array elements should not inherit attacker-controlled properties')
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
