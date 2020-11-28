import type { Options } from "deepmerge"
import deepmerge from "deepmerge"
import test from "tape"
import isPlainObj from 'is-plain-obj'

test(`merging objects with own __proto__`, (t) => {
	const user = {}
	const malicious = JSON.parse(`{ "__proto__": { "admin": true } }`)
	const mergedObject = deepmerge(user, malicious)
	t.notOk(mergedObject.__proto__.admin, `non-plain properties should not be merged`)
	t.notOk(mergedObject.admin, `the destination should have an unmodified prototype`)
	t.end()
})

test(`merging objects with plain and non-plain properties`, (t) => {
	const plainSymbolKey = Symbol(`plainSymbolKey`)
	const parent = {
		parentKey: `should be undefined`,
	}

	const target = Object.create(parent)
	target.plainKey = `should be replaced`
	target[plainSymbolKey] = `should also be replaced`

	const source = {
		parentKey: `foo`,
		plainKey: `bar`,
		newKey: `baz`,
		[plainSymbolKey]: `qux`,
	}

	const mergedObject = deepmerge(target, source)
	t.equal(undefined, mergedObject.parentKey, `inherited properties of target should be removed, not merged or ignored`)
	t.equal(`bar`, mergedObject.plainKey, `enumerable own properties of target should be merged`)
	t.equal(`baz`, mergedObject.newKey, `properties not yet on target should be merged`)
	t.equal(`qux`, mergedObject[plainSymbolKey], `enumerable own symbol properties of target should be merged`)
	t.end()
})

// the following cases come from the thread here: https://github.com/TehShrike/deepmerge/pull/164
test(`merging strings works with a custom string merge`, (t) => {
	const target = { name: `Alexander` }
	const source = { name: `Hamilton` }
	const customMerge: Options[`customMerge`] = (target, source, key, options) => {
		if (key === `name`) {
			return `${ (target as string)[0] }. ${ (source as string).substring(0, 3) }`
		} else {
			return options.deepMerge(target, source)
		}
	}

	const mergeable: Options[`isMergeable`] = (target) =>
		isPlainObj(target) || (typeof target === `string` && target.length > 1)

	t.equal(`A. Ham`, deepmerge(target, source, { customMerge, isMergeable: mergeable }).name)
	t.end()
})

test(`merging objects with null prototype`, (t) => {
	const target = Object.create(null)
	const source = Object.create(null)
	target.wheels = 4
	target.trunk = { toolbox: [ `hammer` ] }
	source.trunk = { toolbox: [ `wrench` ] }
	source.engine = `v8`
	const expected = {
		wheels: 4,
		engine: `v8`,
		trunk: {
			toolbox: [ `hammer`, `wrench` ],
		},
	}

	t.deepEqual(expected, deepmerge(target, source))
	t.end()
})
