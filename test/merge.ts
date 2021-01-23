import type { Options } from "deepmerge"
import { deepmerge as merge } from "deepmerge"
import test from "tape"

test(`add keys in target that do not exist at the root`, (t) => {
	const src = { key1: `value1`, key2: `value2` }
	const target = {}

	const res = merge(target, src)

	t.deepEqual(target, {}, `merge should be immutable`)
	t.deepEqual(res, src)
	t.end()
})

test(`merge existing simple keys in target at the roots`, (t) => {
	const src = { key1: `changed`, key2: `value2` }
	const target = { key1: `value1`, key3: `value3` }

	const expected = {
		key1: `changed`,
		key2: `value2`,
		key3: `value3`,
	}

	t.deepEqual(target, { key1: `value1`, key3: `value3` })
	t.deepEqual(merge(target, src), expected)
	t.end()
})

test(`merge nested objects into target`, (t) => {
	const src = {
		key1: {
			subkey1: `changed`,
			subkey3: `added`,
		},
	}
	const target = {
		key1: {
			subkey1: `value1`,
			subkey2: `value2`,
		},
	}

	const expected = {
		key1: {
			subkey1: `changed`,
			subkey2: `value2`,
			subkey3: `added`,
		},
	}

	t.deepEqual(target, {
		key1: {
			subkey1: `value1`,
			subkey2: `value2`,
		},
	})
	t.deepEqual(merge(target, src), expected)
	t.end()
})

test(`replace simple key with nested object in target`, (t) => {
	const src = {
		key1: {
			subkey1: `subvalue1`,
			subkey2: `subvalue2`,
		},
	}
	const target = {
		key1: `value1`,
		key2: `value2`,
	}

	const expected = {
		key1: {
			subkey1: `subvalue1`,
			subkey2: `subvalue2`,
		},
		key2: `value2`,
	}

	t.deepEqual(target, { key1: `value1`, key2: `value2` })
	t.deepEqual(merge(target, src), expected)
	t.end()
})

test(`should add nested object in target`, (t) => {
	const src = {
		b: {
			c: {},
		},
	}

	const target = {
		a: {},
	}

	const expected = {
		a: {},
		b: {
			c: {},
		},
	}

	t.deepEqual(merge(target, src), expected)
	t.end()
})

test(`should clone source and target`, (t) => {
	const src = {
		b: {
			c: `foo`,
		},
	}

	const target = {
		a: {
			d: `bar`,
		},
	}

	const expected = {
		a: {
			d: `bar`,
		},
		b: {
			c: `foo`,
		},
	}

	const merged = merge(target, src, { clone: true })

	t.deepEqual(merged, expected)

	t.notEqual(merged.a, target.a)
	t.notEqual(merged.b, src.b)

	t.end()
})

test(`should clone source and target`, (t) => {
	const src = {
		b: {
			c: `foo`,
		},
	}

	const target = {
		a: {
			d: `bar`,
		},
	}

	const merged = merge(target, src)
	t.notEqual(merged.a, target.a)
	t.notEqual(merged.b, src.b)

	t.end()
})

test(`should replace object with simple key in target`, (t) => {
	const src = { key1: `value1` }
	const target = {
		key1: {
			subkey1: `subvalue1`,
			subkey2: `subvalue2`,
		},
		key2: `value2`,
	}

	const expected = { key1: `value1`, key2: `value2` }

	t.deepEqual(target, {
		key1: {
			subkey1: `subvalue1`,
			subkey2: `subvalue2`,
		},
		key2: `value2`,
	})
	t.deepEqual(merge(target, src), expected)
	t.end()
})

test(`should replace objects with arrays`, (t) => {
	const target = { key1: { subkey: `one` } }

	const src = { key1: [ `subkey` ] }

	const expected = { key1: [ `subkey` ] }

	t.deepEqual(merge(target, src), expected)
	t.end()
})

test(`should replace arrays with objects`, (t) => {
	const target = { key1: [ `subkey` ] }

	const src = { key1: { subkey: `one` } }

	const expected = { key1: { subkey: `one` } }

	t.deepEqual(merge(target, src), expected)
	t.end()
})

test(`should replace dates with arrays`, (t) => {
	const target = { key1: new Date() }

	const src = { key1: [ `subkey` ] }

	const expected = { key1: [ `subkey` ] }

	t.deepEqual(merge(target, src), expected)
	t.end()
})

test(`should replace null with arrays`, (t) => {
	const target = {
		key1: null,
	}

	const src = {
		key1: [ `subkey` ],
	}

	const expected = {
		key1: [ `subkey` ],
	}

	t.deepEqual(merge(target, src), expected)
	t.end()
})

test(`should work on simple array`, (t) => {
	const src = [ `one`, `three` ]
	const target = [ `one`, `two` ]

	const expected = [ `one`, `two`, `one`, `three` ]

	t.deepEqual(merge(target, src), expected)
	t.ok(Array.isArray(merge(target, src)))
	t.end()
})

test(`should work on another simple array`, (t) => {
	const target = [ `a1`, `a2`, `c1`, `f1`, `p1` ]
	const src = [ `t1`, `s1`, `c2`, `r1`, `p2`, `p3` ]

	const expected = [ `a1`, `a2`, `c1`, `f1`, `p1`, `t1`, `s1`, `c2`, `r1`, `p2`, `p3` ]
	t.deepEqual(target, [ `a1`, `a2`, `c1`, `f1`, `p1` ])
	t.deepEqual(merge(target, src), expected)
	t.ok(Array.isArray(merge(target, src)))
	t.end()
})

test(`should work on array properties`, (t) => {
	const src = {
		key1: [ `one`, `three` ],
		key2: [ `four` ],
	}
	const target = {
		key1: [ `one`, `two` ],
	}

	const expected = {
		key1: [ `one`, `two`, `one`, `three` ],
		key2: [ `four` ],
	}

	t.deepEqual(merge(target, src), expected)
	t.ok(Array.isArray(merge(target, src).key1))
	t.ok(Array.isArray(merge(target, src).key2))
	t.end()
})

test(`should work on array properties with clone option`, (t) => {
	const src = {
		key1: [ `one`, `three` ],
		key2: [ `four` ],
	}
	const target = {
		key1: [ `one`, `two` ],
	}

	t.deepEqual(target, {
		key1: [ `one`, `two` ],
	})
	const merged = merge(target, src, { clone: true })
	t.notEqual(merged.key1, src.key1)
	t.notEqual(merged.key1, target.key1)
	t.notEqual(merged.key2, src.key2)
	t.end()
})

test(`should work on array of objects`, (t) => {
	const src = [
		{ key1: [ `one`, `three` ], key2: [ `one` ] },
		{ key3: [ `five` ] },
	]
	const target = [
		{ key1: [ `one`, `two` ] },
		{ key3: [ `four` ] },
	]

	const expected = [
		{ key1: [ `one`, `two` ] },
		{ key3: [ `four` ] },
		{ key1: [ `one`, `three` ], key2: [ `one` ] },
		{ key3: [ `five` ] },
	]

	t.deepEqual(merge(target, src), expected)
	t.ok(Array.isArray(merge(target, src)), `result should be an array`)
	t.ok(Array.isArray(merge(target, src)[0].key1), `subkey should be an array too`)

	t.end()
})

test(`should work on array of objects with clone option`, (t) => {
	const src = [
		{ key1: [ `one`, `three` ], key2: [ `one` ] },
		{ key3: [ `five` ] },
	]
	const target = [
		{ key1: [ `one`, `two` ] },
		{ key3: [ `four` ] },
	]

	const expected = [
		{ key1: [ `one`, `two` ] },
		{ key3: [ `four` ] },
		{ key1: [ `one`, `three` ], key2: [ `one` ] },
		{ key3: [ `five` ] },
	]

	const merged = merge(target, src, { clone: true })
	t.deepEqual(merged, expected)
	t.ok(Array.isArray(merge(target, src)), `result should be an array`)
	t.ok(Array.isArray(merge(target, src)[0].key1), `subkey should be an array too`)
	t.notEqual(merged[0].key1, src[0].key1)
	t.notEqual(merged[0].key1, target[0].key1)
	t.false(Object.prototype.hasOwnProperty.call(merged[0], `key2`), `"key2" should not exist on "merged[0]"`)
	t.notEqual(merged[1].key3, src[1].key3)
	t.notEqual(merged[1].key3, target[1].key3)
	t.end()
})

test(`should treat regular expressions like primitive values`, (t) => {
	const target = { key1: /abc/ }
	const src = { key1: /efg/ }
	const expected = { key1: /efg/ }

	t.deepEqual(merge(target, src), expected)
	t.deepEqual(merge(target, src).key1.test(`efg`), true)
	t.end()
})

test(`should treat regular expressions like primitive values and should not`
				+ ` clone even with clone option`, (t) => {
	const target = { key1: /abc/ }
	const src = { key1: /efg/ }

	const output = merge(target, src, { clone: true })

	t.equal(output.key1, src.key1)
	t.end()
},
)

test(`should treat dates like primitives`, (t) => {
	const monday = new Date(`2016-09-27T01:08:12.761Z`)
	const tuesday = new Date(`2016-09-28T01:18:12.761Z`)

	const target = {
		key: monday,
	}
	const source = {
		key: tuesday,
	}

	const expected = {
		key: tuesday,
	}
	const actual = merge(target, source)

	t.deepEqual(actual, expected)
	t.equal(actual.key.valueOf(), tuesday.valueOf())
	t.end()
})

test(`should treat dates like primitives and should not clone even with clone`
				+ ` option`, (t) => {
	const monday = new Date(`2016-09-27T01:08:12.761Z`)
	const tuesday = new Date(`2016-09-28T01:18:12.761Z`)

	const target = {
		key: monday,
	}
	const source = {
		key: tuesday,
	}

	const actual = merge(target, source, { clone: true })

	t.equal(actual.key, tuesday)
	t.end()
})

test(`should work on array with null in it`, (t) => {
	const target = []

	const src = [ null ]

	const expected = [ null ]

	t.deepEqual(merge(target, src), expected)
	t.end()
})

test(`should clone array's element if it is object`, (t) => {
	const a = { key: `yup` }
	const target = []
	const source = [ a ]

	const output = merge(target, source, { clone: true })

	t.notEqual(output[0], a)
	t.equal(output[0].key, `yup`)
	t.end()
})

test(`should clone an array property when there is no target array`, (t) => {
	const someObject = {}
	const target = {}
	const source = { ary: [ someObject ] }
	const output = merge(target, source, { clone: true })

	t.deepEqual(output, { ary: [{}] })
	t.notEqual(output.ary[0], someObject)
	t.end()
})

test(`should overwrite values when property is initialised but undefined`, (t) => {
	const target1 = { value: [] }
	const target2 = { value: null }
	const target3 = { value: 2 }

	const src = { value: undefined }

	function hasUndefinedProperty(o) {
		t.ok(Object.prototype.hasOwnProperty.call(o, `value`))
		t.equal(typeof o.value, `undefined`)
	}

	hasUndefinedProperty(merge(target1, src))
	hasUndefinedProperty(merge(target2, src))
	hasUndefinedProperty(merge(target3, src))

	t.end()
})

test(`dates should copy correctly in an array`, (t) => {
	const monday = new Date(`2016-09-27T01:08:12.761Z`)
	const tuesday = new Date(`2016-09-28T01:18:12.761Z`)

	const target = [ monday, `dude` ]
	const source = [ tuesday, `lol` ]

	const expected = [ monday, `dude`, tuesday, `lol` ]
	const actual = merge(target, source)

	t.deepEqual(actual, expected)
	t.end()
})

test(`should handle custom merge functions`, (t) => {
	const target = {
		letters: [ `a`, `b` ],
		people: {
			first: `Alex`,
			second: `Bert`,
		},
	}

	const source = {
		letters: [ `c` ],
		people: {
			first: `Smith`,
			second: `Bertson`,
			third: `Car`,
		},
	}

	const mergePeople = (target: Record<string, string>, source: Record<string, string>) => {
		const keys = new Set(Object.keys(target).concat(Object.keys(source)))
		const destination = {}
		keys.forEach((key) => {
			if (key in target && key in source) {
				destination[key] = `${ target[key] }-${ source[key] }`
			} else if (key in target) {
				destination[key] = target[key]
			} else {
				destination[key] = source[key]
			}
		})
		return destination
	}

	const options: Options = {
		customMerge: (key) => {
			if (key === `people`) {
				return mergePeople
			}

			return merge
		},
	}

	const expected = {
		letters: [ `a`, `b`, `c` ],
		people: {
			first: `Alex-Smith`,
			second: `Bert-Bertson`,
			third: `Car`,
		},
	}

	const actual = merge(target, source, options)
	t.deepEqual(actual, expected)
	t.end()
})


test(`should handle custom merge functions`, (t) => {
	const target = {
		letters: [ `a`, `b` ],
		people: {
			first: `Alex`,
			second: `Bert`,
		},
	}

	const source = {
		letters: [ `c` ],
		people: {
			first: `Smith`,
			second: `Bertson`,
			third: `Car`,
		},
	}

	const mergeLetters = (_target: string, _source: string) => `merged letters`

	const options: Options = {
		customMerge: (key) => {
			if (key === `letters`) {
				return mergeLetters
			}
		},
	}

	const expected = {
		letters: `merged letters`,
		people: {
			first: `Smith`,
			second: `Bertson`,
			third: `Car`,
		},
	}

	const actual = merge(target, source, options)
	t.deepEqual(actual, expected)
	t.end()
})

test(`should merge correctly if custom merge is not a valid function`, (t) => {
	const target = {
		letters: [ `a`, `b` ],
		people: {
			first: `Alex`,
			second: `Bert`,
		},
	}

	const source = {
		letters: [ `c` ],
		people: {
			first: `Smith`,
			second: `Bertson`,
			third: `Car`,
		},
	}

	const expected = {
		letters: [ `a`, `b`, `c` ],
		people: {
			first: `Smith`,
			second: `Bertson`,
			third: `Car`,
		},
	}

	const actual = merge(target, source)
	t.deepEqual(actual, expected)
	t.end()
})

test(`copy symbol keys in target that do not exist on the target`, (t) => {
	const mySymbol = Symbol()
	const src = { [mySymbol]: `value1` }
	const target = {}

	const res = merge(target, src)

	t.equal(res[mySymbol], `value1`)
	t.deepEqual(Object.getOwnPropertySymbols(res), Object.getOwnPropertySymbols(src))
	t.end()
})

test(`copy symbol keys in target that do exist on the target`, (t) => {
	const mySymbol = Symbol()
	const src = { [mySymbol]: `value1` }
	const target = { [mySymbol]: `wat` }

	const res = merge(target, src)

	t.equal(res[mySymbol as unknown as string], `value1`)
	t.end()
})

test(`should not mutate options`, (t) => {
	const options: Options = {}

	merge({}, {}, options)

	t.deepEqual(options, {})
	t.end()
})

test(`Falsey properties should be mergeable`, (t) => {
	const uniqueValue = {}

	const target = {
		wat: false,
	}

	const source = {
		wat: false,
	}

	let customMergeWasCalled = false

	const result = merge(target, source, {
		isMergeable() {
			return true
		},
		customMerge() {
			return function() {
				customMergeWasCalled = true
				return uniqueValue
			}
		},
	})

	t.equal(result.wat, uniqueValue)
	t.ok(customMergeWasCalled, `custom merge function was called`)
	t.end()
})

// test(`With mergeWithTarget=true, merge should mutate the root target`, (t) => {
// 	const destination = {}
// 	const output = merge(destination, {
// 		sup: true,
// 	}, { mergeWithTarget: true })

// 	t.notEqual(destination, {})
// 	t.equal(destination, output)
// 	t.end()
// })
