var merge = require('../')
var test = require('tape')

test('isMergeableObject function copying object over object', function(t) {
	var src = { key: { isMergeable: false }, baz: 'yes' }
	var target = { key: { foo: 'wat' }, baz: 'whatever' }

	function isMergeableObject(object) {
		return object && typeof value === 'object' && object.isMergeable !== false
	}

	var res = merge(target, src, {
		isMergeableObject: isMergeableObject
	})

	t.deepEqual(res, { key: { isMergeable: false }, baz: 'yes' })
	t.equal(res.key, src.key, 'Object has the same identity and was not cloned')
	t.end()
})

test('isMergeableObject function copying object over nothing', function(t) {
	var src = { key: { isMergeable: false, foo: 'bar' }, baz: 'yes' }
	var target = { baz: 'whatever' }

	function isMergeableObject(object) {
		return object && typeof value === 'object' && object.isMergeable !== false
	}

	var res = merge(target, src, {
		isMergeableObject: isMergeableObject
	})

	t.deepEqual(res, { key: { isMergeable: false, foo: 'bar' }, baz: 'yes' })
	t.equal(res.key, src.key, 'Object has the same identity and was not cloned')
	t.end()
})
