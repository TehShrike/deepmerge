const merge = require(`../`).default
const test = require(`tape`)

test(`isMergeable function copying object over object`, (t) => {
	const src = { key: { isMergeable: false }, baz: `yes` }
	const target = { key: { foo: `wat` }, baz: `whatever` }

	function customIsMergeable(object) {
		return object && typeof value === `object` && object.isMergeable !== false
	}

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

	function customIsMergeable(object) {
		return object && typeof value === `object` && object.isMergeable !== false
	}

	const res = merge(target, src, {
		isMergeable: customIsMergeable,
	})

	t.deepEqual(res, { key: { isMergeable: false, foo: `bar` }, baz: `yes` })
	t.equal(res.key, src.key, `Object has the same identity and was not cloned`)
	t.end()
})
