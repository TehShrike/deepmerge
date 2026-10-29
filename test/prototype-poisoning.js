var merge = require('../')
var test = require('tape')
var isMergeableObject = require('is-mergeable-object')

function assertSafeObject(t, object) {
	t.equal(Object.getPrototypeOf(object), Object.prototype, 'result keeps the ordinary object prototype')
	t.equal(object.admin, undefined, 'result does not inherit attacker-controlled properties')
	t.notOk(Object.prototype.hasOwnProperty.call(object, '__proto__'), 'result omits the __proto__ key')
}

test('rejects source __proto__ regardless of the target shape', function(t) {
	var source = JSON.parse('{ "__proto__": { "admin": true }, "safe": true }')
	var targets = [Object.create(null), null, undefined, false, 0, '',
		JSON.parse('{ "__proto__": { "admin": false } }')]

	targets.forEach(function(target) {
		var result = merge(target, source)
		assertSafeObject(t, result)
		t.equal(result.safe, true, 'ordinary source properties are preserved')
	})
	t.equal(source.__proto__.admin, true, 'source is unchanged')
	t.equal(Object.prototype.admin, undefined, 'global prototype is unchanged')
	t.end()
})

test('rejects __proto__ while copying the target, including with clone disabled', function(t) {
	;[true, false].forEach(function(clone) {
		var target = JSON.parse('{ "__proto__": { "admin": true }, "safe": { "value": 1 } }')
		var result = merge(target, { added: true }, { clone: clone })

		assertSafeObject(t, result)
		t.deepEqual(result.safe, { value: 1 }, 'ordinary target properties are preserved')
		t.equal(result.added, true, 'ordinary source properties are preserved')
		t.equal(target.__proto__.admin, true, 'target is unchanged')
		t.equal(Object.getPrototypeOf(target), Object.prototype, 'target prototype is unchanged')
	})
	t.end()
})

test('rejects nested __proto__ when replacing placeholder values', function(t) {
	var source = JSON.parse('{ "session": { "__proto__": { "admin": true }, "safe": true } }')
	;[null, undefined, false, 0, '', Object.create(null)].forEach(function(value) {
		var result = merge({ session: value }, source)
		assertSafeObject(t, result.session)
		t.equal(result.session.safe, true, 'ordinary nested properties are preserved')
	})
	t.end()
})

test('rejects __proto__ when cloning nested objects and array elements', function(t) {
	var payload = JSON.parse('{ "__proto__": { "admin": true }, "safe": true }')
	var target = { nested: payload, items: [payload] }
	var source = { other: payload, items: [payload] }
	var result = merge(target, source)

	;[result.nested, result.other, result.items[0], result.items[1]].forEach(function(object) {
		assertSafeObject(t, object)
		t.equal(object.safe, true, 'ordinary cloned properties are preserved')
		t.notEqual(object, payload, 'cloned objects retain their independence')
	})
	t.end()
})

test('merge.all cannot introduce an attacker-controlled prototype', function(t) {
	var payload = JSON.parse('{ "session": { "__proto__": { "admin": true }, "safe": true } }')
	var result = merge.all([{ session: null }, payload, { session: { added: true } }])

	assertSafeObject(t, result.session)
	t.deepEqual(result.session, { safe: true, added: true }, 'ordinary properties merge across inputs')
	t.end()
})

test('rejects __proto__ before reading getters or calling custom merge functions', function(t) {
	var target = { safe: true }
	var source = { added: true }
	function unexpectedAccess() {
		t.fail('__proto__ must not be read or passed to a custom merge function')
		return { admin: true }
	}
	;[target, source].forEach(function(object) {
		Object.defineProperty(object, '__proto__', { enumerable: true, get: unexpectedAccess })
	})
	var result = merge(target, source, {
		customMerge: function(key) {
			if (key === '__proto__') {
				unexpectedAccess()
			}
		},
	})

	assertSafeObject(t, result)
	t.deepEqual(result, { safe: true, added: true }, 'safe properties still merge')
	t.end()
})

test('preserves legitimate own constructor, prototype and symbol properties', function(t) {
	var symbol = Symbol('__proto__')
	var target = JSON.parse('{ "constructor": { "first": true }, "prototype": { "first": true } }')
	var source = JSON.parse('{ "constructor": { "second": true }, "prototype": { "second": true } }')
	source[symbol] = { safe: true }
	var result = merge(target, source)

	t.deepEqual(result.constructor, { first: true, second: true }, 'own constructor properties still merge')
	t.deepEqual(result.prototype, { first: true, second: true }, 'own prototype properties still merge')
	t.deepEqual(result[symbol], { safe: true }, 'symbols with the same description remain supported')
	t.notEqual(result[symbol], source[symbol], 'symbol values are still cloned')
	assertSafeObject(t, result)
	t.end()
})

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
