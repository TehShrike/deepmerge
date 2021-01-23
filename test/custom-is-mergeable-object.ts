import { deepmerge as merge } from "deepmerge"
import test from "tape"

test('isMergeable function copying object over object', function(t) {
	var src = { key: { isMergeable: false }, baz: 'yes' }
	var target = { key: { foo: 'wat' }, baz: 'whatever' }

	function customIsMergeable(object) {
		return object && typeof value === 'object' && object.isMergeable !== false
	}

	var res = merge(target, src, {
		isMergeable: customIsMergeable
	})

	t.deepEqual(res, { key: { isMergeable: false }, baz: 'yes' })
	t.equal(res.key, src.key, 'Object has the same identity and was not cloned')
	t.end()
})

test('isMergeable function copying object over nothing', function(t) {
	var src = { key: { isMergeable: false, foo: 'bar' }, baz: 'yes' }
	var target = { baz: 'whatever' }

	function customIsMergeable(object) {
		return object && typeof value === 'object' && object.isMergeable !== false
	}

	var res = merge(target, src, {
		isMergeable: customIsMergeable
	})

	t.deepEqual(res, { key: { isMergeable: false, foo: 'bar' }, baz: 'yes' })
	t.equal(res.key, src.key, 'Object has the same identity and was not cloned')
	t.end()
})
