import type { Options } from "deepmerge"
import { deepmerge as merge } from "deepmerge"
import test from "tape"

test(`isMergeable function copying object over object`, (t) => {
	const src = { key: { isMergeable: false }, baz: `yes` }
	const target = { key: { foo: `wat` }, baz: `whatever` }

	const customIsMergeable: Options[`isMergeable`] = (object) =>
		object && typeof object === `object` && object.isMergeable !== false

	const res = merge(target, src, {
		isMergeable: customIsMergeable,
	})

	t.deepEqual(res, { key: { isMergeable: false }, baz: `yes` })
	t.equal(res.key, src.key, `Object has the same identity and was not cloned`)
	t.end()
})

test(`isMergeable function copying object over nothing`, (t) => {
	const src = { key: { isMergeable: false, foo: `bar` }, baz: `yes` }
	const target = { baz: `whatever` }

	const customIsMergeable: Options[`isMergeable`] = (object) =>
		object && typeof object === `object` && object.isMergeable !== false

	const res = merge(target, src, {
		isMergeable: customIsMergeable,
	})

	t.deepEqual(res, { key: { isMergeable: false, foo: `bar` }, baz: `yes` })
	t.equal(res.key, src.key, `Object has the same identity and was not cloned`)
	t.end()
})
