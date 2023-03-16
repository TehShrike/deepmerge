const merge = require(`..`)
const test = require(`tape`)

test(`isMergeableObject function copying object over object`, t => {
	const src = { key: { isMergeable: false }, baz: `yes` }
	const target = { key: { foo: `wat` }, baz: `whatever` }

	function isMergeableObject(object) {
		return object && typeof value === `object` && object.isMergeable !== false
	}

	const res = merge(target, src, {
		isMergeableObject,
	})

	t.deepEqual(res, { key: { isMergeable: false }, baz: `yes` })
	t.equal(res.key, src.key, `Object has the same identity and was not cloned`)
	t.end()
})

test(`isMergeableObject function copying object over nothing`, t => {
	const src = { key: { isMergeable: false, foo: `bar` }, baz: `yes` }
	const target = { baz: `whatever` }

	function isMergeableObject(object) {
		return object && typeof value === `object` && object.isMergeable !== false
	}

	const res = merge(target, src, {
		isMergeableObject,
	})

	t.deepEqual(res, { key: { isMergeable: false, foo: `bar` }, baz: `yes` })
	t.equal(res.key, src.key, `Object has the same identity and was not cloned`)
	t.end()
})

test(`example from readme`, t => {
	const { isPlainObject } = require(`is-plain-object`)

	function SuperSpecial() {
		this.special = `oh yeah man totally`
	}

	const instantiatedSpecialObject = new SuperSpecial()

	const target = {
		someProperty: {
			cool: `oh for sure`,
		},
	}

	const source = {
		someProperty: instantiatedSpecialObject,
	}

	const defaultOutput = merge(target, source)

	t.equal(defaultOutput.someProperty.cool, `oh for sure`)
	t.equal(defaultOutput.someProperty.special, `oh yeah man totally`)
	t.equal(defaultOutput.someProperty instanceof SuperSpecial, false)

	const customMergeOutput = merge(target, source, {
		isMergeableObject: isPlainObject,
	})

	t.equal(customMergeOutput.someProperty.cool, undefined)
	t.equal(customMergeOutput.someProperty.special, `oh yeah man totally`)
	t.equal(customMergeOutput.someProperty instanceof SuperSpecial, true)

	t.end()
})
