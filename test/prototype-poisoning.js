const merge = require(`../`).default
const test = require(`tape`)
const isMergeableObject = require(`is-mergeable-object`)

test(`merging objects with own __proto__`, (t) => {
	const user = {}
	const malicious = JSON.parse(`{ "__proto__": { "admin": true } }`)
	const mergedObject = merge(user, malicious)
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

	const mergedObject = merge(target, source)
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
	function customMerge(key, options) {
		if (key === `name`) {
			return function(target, source, options) {
				return target[0] + `. ` + source.substring(0, 3)
			}
		} else {
			return merge
		}
	}

	function mergeable(target) {
		return isMergeableObject(target) || (typeof target === `string` && target.length > 1)
	}

	t.equal(`A. Ham`, merge(target, source, { customMerge, isMergeable: mergeable }).name)
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

	t.deepEqual(expected, merge(target, source))
	t.end()
})
