var merge = require('../')
var test = require('tape')

test('should handle an undefined value in the target object when merging', function(t) {
	var src = { key1: 'value1', key2: { key4: 'value4'}, key3: ['value3'], key5: undefined }
	var target = { key1: 'value', key2: undefined, key3: undefined, key5: ['value5'], key6: ['value6'], key7: { key8: 'value8'} }

	var notClonedRes = merge(target, src, {mergeWithTarget: true})

	// Undefined target
	t.assert(notClonedRes.key2 === target.key2, 'should merge object source into undefined value');
	t.assert(notClonedRes.key3 === target.key3, 'should merge array source into undefined target');
	t.assert(typeof notClonedRes.key2 === 'object', 'should retain object type when merging into undefined target');
	t.assert(Array.isArray(notClonedRes.key3), 'should retain array type when merging into undefined target');

	// Explicit undefined source
	t.assert(typeof key5 === 'undefined', 'should overwrite target value with explicitly undefined source value');

	// Not defined source props
	t.assert(Array.isArray(notClonedRes.key6), 'should preserve target property value when no source value exists');
	t.assert(typeof notClonedRes.key7 === 'object', 'should preserve target property value when no source value exists');
	t.end()
})

test('result should retain target type information when mergeWithTarget set to true', function(t) {
	var src = { key1: 'value1', key2: 'value2' }
	class CustomType {}
	var target = new CustomType()

	var res = merge(target, src, {mergeWithTarget: true})
	t.not(src instanceof CustomType)
	t.assert(target instanceof CustomType)
	t.assert(res instanceof CustomType)
	t.end()
})

test('modify target object if mergeWithTarget set to true', function(t) {
	var src = { key1: 'value1', key2: 'value2' }
	var target = { key3: 'value3'}

	var clonedRes = merge(target, src)
	var notClonedRes = merge(target, src, {mergeWithTarget: true})

	t.assert(clonedRes !== target, 'result should be cloned')
	t.assert(notClonedRes === target, 'result should maintain target reference')
	t.end()
})

test('merge.all mutates target object when mergeWithTarget set to true', function(t) {
	var src = { key1: 'value1', key2: 'value2' }
	var target = { key3: 'value3'}

	var clonedRes = merge.all([target, src])
	var notClonedRes = merge.all([target, src], {mergeWithTarget: true})

	t.assert(clonedRes !== target, 'result should be cloned')
	t.assert(notClonedRes === target, 'result should maintain first array entry reference')
	t.end()
})

test('add keys in target that do not exist at the root', function(t) {
	var src = { key1: 'value1', key2: 'value2' }
	var target = {}

	var res = merge(target, src)

	t.deepEqual(target, {}, 'merge should be immutable')
	t.deepEqual(res, src)
	t.end()
})

test('merge existing simple keys in target at the roots', function(t) {
	var src = { key1: 'changed', key2: 'value2' }
	var target = { key1: 'value1', key3: 'value3' }

	var expected = {
		key1: 'changed',
		key2: 'value2',
		key3: 'value3',
	}

	t.deepEqual(target, { key1: 'value1', key3: 'value3' })
	t.deepEqual(merge(target, src), expected)
	t.end()
})

test('merge nested objects into target', function(t) {
	var src = {
		key1: {
			subkey1: 'changed',
			subkey3: 'added',
		},
	}
	var target = {
		key1: {
			subkey1: 'value1',
			subkey2: 'value2',
		},
	}

	var expected = {
		key1: {
			subkey1: 'changed',
			subkey2: 'value2',
			subkey3: 'added',
		},
	}

	t.deepEqual(target, {
		key1: {
			subkey1: 'value1',
			subkey2: 'value2',
		},
	})
	t.deepEqual(merge(target, src), expected)
	t.end()
})

test('replace simple key with nested object in target', function(t) {
	var src = {
		key1: {
			subkey1: 'subvalue1',
			subkey2: 'subvalue2',
		},
	}
	var target = {
		key1: 'value1',
		key2: 'value2',
	}

	var expected = {
		key1: {
			subkey1: 'subvalue1',
			subkey2: 'subvalue2',
		},
		key2: 'value2',
	}

	t.deepEqual(target, { key1: 'value1', key2: 'value2' })
	t.deepEqual(merge(target, src), expected)
	t.end()
})

test('should add nested object in target', function(t) {
	var src = {
		"b": {
			"c": {},
		},
	}

	var target = {
		"a": {},
	}

	var expected = {
		"a": {},
		"b": {
			"c": {},
		},
	}

	t.deepEqual(merge(target, src), expected)
	t.end()
})

test('should clone source and target', function(t) {
	var src = {
		"b": {
			"c": "foo",
		},
	}

	var target = {
		"a": {
			"d": "bar",
		},
	}

	var expected = {
		"a": {
			"d": "bar",
		},
		"b": {
			"c": "foo",
		},
	}

	var merged = merge(target, src, { clone: true })

	t.deepEqual(merged, expected)

	t.notEqual(merged.a, target.a)
	t.notEqual(merged.b, src.b)

	t.end()
})

test('should clone source and target', function(t) {
	var src = {
		"b": {
			"c": "foo",
		},
	}

	var target = {
		"a": {
			"d": "bar",
		},
	}

	var merged = merge(target, src)
	t.notEqual(merged.a, target.a)
	t.notEqual(merged.b, src.b)

	t.end()
})

test('should replace object with simple key in target', function(t) {
	var src = { key1: 'value1' }
	var target = {
		key1: {
			subkey1: 'subvalue1',
			subkey2: 'subvalue2',
		},
		key2: 'value2',
	}

	var expected = { key1: 'value1', key2: 'value2' }

	t.deepEqual(target, {
		key1: {
			subkey1: 'subvalue1',
			subkey2: 'subvalue2',
		},
		key2: 'value2',
	})
	t.deepEqual(merge(target, src), expected)
	t.end()
})

test('should replace objects with arrays', function(t) {
	var target = { key1: { subkey: 'one' } }

	var src = { key1: [ 'subkey' ] }

	var expected = { key1: [ 'subkey' ] }

	t.deepEqual(merge(target, src), expected)
	t.end()
})

test('should replace arrays with objects', function(t) {
	var target = { key1: [ "subkey" ] }

	var src = { key1: { subkey: 'one' } }

	var expected = { key1: { subkey: 'one' } }

	t.deepEqual(merge(target, src), expected)
	t.end()
})

test('should replace dates with arrays', function(t) {
	var target = { key1: new Date() }

	var src = { key1: [ "subkey" ] }

	var expected = { key1: [ "subkey" ] }

	t.deepEqual(merge(target, src), expected)
	t.end()
})

test('should replace null with arrays', function(t) {
	var target = {
		key1: null,
	}

	var src = {
		key1: [ "subkey" ],
	}

	var expected = {
		key1: [ "subkey" ],
	}

	t.deepEqual(merge(target, src), expected)
	t.end()
})

test('should work on simple array', function(t) {
	var src = [ 'one', 'three' ]
	var target = [ 'one', 'two' ]

	var expected = [ 'one', 'two', 'one', 'three' ]

	t.deepEqual(merge(target, src), expected)
	t.ok(Array.isArray(merge(target, src)))
	t.end()
})

test('should work on another simple array', function(t) {
	var target = [ "a1", "a2", "c1", "f1", "p1" ]
	var src = [ "t1", "s1", "c2", "r1", "p2", "p3" ]

	var expected = [ "a1", "a2", "c1", "f1", "p1", "t1", "s1", "c2", "r1", "p2", "p3" ]
	t.deepEqual(target, [ "a1", "a2", "c1", "f1", "p1" ])
	t.deepEqual(merge(target, src), expected)
	t.ok(Array.isArray(merge(target, src)))
	t.end()
})

test('should work on array properties', function(t) {
	var src = {
		key1: [ 'one', 'three' ],
		key2: [ 'four' ],
	}
	var target = {
		key1: [ 'one', 'two' ],
	}

	var expected = {
		key1: [ 'one', 'two', 'one', 'three' ],
		key2: [ 'four' ],
	}

	t.deepEqual(merge(target, src), expected)
	t.ok(Array.isArray(merge(target, src).key1))
	t.ok(Array.isArray(merge(target, src).key2))
	t.end()
})

test('should work on array properties with clone option', function(t) {
	var src = {
		key1: [ 'one', 'three' ],
		key2: [ 'four' ],
	}
	var target = {
		key1: [ 'one', 'two' ],
	}

	t.deepEqual(target, {
		key1: [ 'one', 'two' ],
	})
	var merged = merge(target, src, { clone: true })
	t.notEqual(merged.key1, src.key1)
	t.notEqual(merged.key1, target.key1)
	t.notEqual(merged.key2, src.key2)
	t.end()
})

test('should work on array of objects', function(t) {
	var src = [
		{ key1: [ 'one', 'three' ], key2: [ 'one' ] },
		{ key3: [ 'five' ] },
	]
	var target = [
		{ key1: [ 'one', 'two' ] },
		{ key3: [ 'four' ] },
	]

	var expected = [
		{ key1: [ 'one', 'two' ] },
		{ key3: [ 'four' ] },
		{ key1: [ 'one', 'three' ], key2: [ 'one' ] },
		{ key3: [ 'five' ] },
	]

	t.deepEqual(merge(target, src), expected)
	t.ok(Array.isArray(merge(target, src)), 'result should be an array')
	t.ok(Array.isArray(merge(target, src)[0].key1), 'subkey should be an array too')

	t.end()
})

test('should work on array of objects with clone option', function(t) {
	var src = [
		{ key1: [ 'one', 'three' ], key2: [ 'one' ] },
		{ key3: [ 'five' ] },
	]
	var target = [
		{ key1: [ 'one', 'two' ] },
		{ key3: [ 'four' ] },
	]

	var expected = [
		{ key1: [ 'one', 'two' ] },
		{ key3: [ 'four' ] },
		{ key1: [ 'one', 'three' ], key2: [ 'one' ] },
		{ key3: [ 'five' ] },
	]

	var merged = merge(target, src, { clone: true })
	t.deepEqual(merged, expected)
	t.ok(Array.isArray(merge(target, src)), 'result should be an array')
	t.ok(Array.isArray(merge(target, src)[0].key1), 'subkey should be an array too')
	t.notEqual(merged[0].key1, src[0].key1)
	t.notEqual(merged[0].key1, target[0].key1)
	t.notEqual(merged[0].key2, src[0].key2)
	t.notEqual(merged[1].key3, src[1].key3)
	t.notEqual(merged[1].key3, target[1].key3)
	t.end()
})

test('should treat regular expressions like primitive values', function(t) {
	var target = { key1: /abc/ }
	var src = { key1: /efg/ }
	var expected = { key1: /efg/ }

	t.deepEqual(merge(target, src), expected)
	t.deepEqual(merge(target, src).key1.test('efg'), true)
	t.end()
})

test('should treat regular expressions like primitive values and should not'
				+ ' clone even with clone option', function(t) {
	var target = { key1: /abc/ }
	var src = { key1: /efg/ }

	var output = merge(target, src, { clone: true })

	t.equal(output.key1, src.key1)
	t.end()
}
)

test('should treat dates like primitives', function(t) {
	var monday = new Date('2016-09-27T01:08:12.761Z')
	var tuesday = new Date('2016-09-28T01:18:12.761Z')

	var target = {
		key: monday,
	}
	var source = {
		key: tuesday,
	}

	var expected = {
		key: tuesday,
	}
	var actual = merge(target, source)

	t.deepEqual(actual, expected)
	t.equal(actual.key.valueOf(), tuesday.valueOf())
	t.end()
})

test('should treat dates like primitives and should not clone even with clone'
				+  ' option', function(t) {
	var monday = new Date('2016-09-27T01:08:12.761Z')
	var tuesday = new Date('2016-09-28T01:18:12.761Z')

	var target = {
		key: monday,
	}
	var source = {
		key: tuesday,
	}

	var actual = merge(target, source, { clone: true })

	t.equal(actual.key, tuesday)
	t.end()
})

test('should work on array with null in it', function(t) {
	var target = []

	var src = [ null ]

	var expected = [ null ]

	t.deepEqual(merge(target, src), expected)
	t.end()
})

test('should clone array\'s element if it is object', function(t) {
	var a = { key: 'yup' }
	var target = []
	var source = [ a ]

	var output = merge(target, source, { clone: true })

	t.notEqual(output[0], a)
	t.equal(output[0].key, 'yup')
	t.end()
})

test('should clone an array property when there is no target array', function(t) {
	const someObject = {}
	var target = {}
	var source = { ary: [ someObject ] }
	var output = merge(target, source, { clone: true })

	t.deepEqual(output, { ary: [{}] })
	t.notEqual(output.ary[0], someObject)
	t.end()
})

test('should overwrite values when property is initialised but undefined', function(t) {
	var target1 = { value: [] }
	var target2 = { value: null }
	var target3 = { value: 2 }

	var src = { value: undefined }

	function hasUndefinedProperty(o) {
		t.ok(o.hasOwnProperty('value'))
		t.equal(typeof o.value, 'undefined')
	}

	hasUndefinedProperty(merge(target1, src))
	hasUndefinedProperty(merge(target2, src))
	hasUndefinedProperty(merge(target3, src))

	t.end()
})

test('dates should copy correctly in an array', function(t) {
	var monday = new Date('2016-09-27T01:08:12.761Z')
	var tuesday = new Date('2016-09-28T01:18:12.761Z')

	var target = [ monday, 'dude' ]
	var source = [ tuesday, 'lol' ]

	var expected = [ monday, 'dude', tuesday, 'lol' ]
	var actual = merge(target, source)

	t.deepEqual(actual, expected)
	t.end()
})

test('should handle custom merge functions', function(t) {
	var target = {
		letters: ['a', 'b'],
		people: {
			first: 'Alex',
			second: 'Bert',
		}
	}

	var source = {
		letters: ['c'],
		people: {
			first: 'Smith',
			second: 'Bertson',
			third: 'Car'
		}
	}

    const mergePeople = (target, source, options) => {
       const keys = new Set(Object.keys(target).concat(Object.keys(source)))
	   const destination = {}
       keys.forEach(key => {
           if (key in target && key in source) {
               destination[key] = `${target[key]}-${source[key]}`
           } else if (key in target) {
               destination[key] = target[key]
           } else {
               destination[key] = source[key]
           }
	   })
       return destination
   }

   const options = {
       customMerge: (key, options) => {
         if (key === 'people') {
           return mergePeople
		 }

		 return merge
       }
   }

	var expected = {
		letters: ['a', 'b', 'c'],
		people: {
			first: 'Alex-Smith',
			second: 'Bert-Bertson',
			third: 'Car'
		}
	}

	var actual = merge(target, source, options)
	t.deepEqual(actual, expected)
	t.end()
})


test('should handle custom merge functions', function(t) {
	var target = {
		letters: ['a', 'b'],
		people: {
			first: 'Alex',
			second: 'Bert',
		}
	}

	var source = {
		letters: ['c'],
		people: {
			first: 'Smith',
			second: 'Bertson',
			third: 'Car'
		}
	}

    const mergeLetters = (target, source, options) => {
      return 'merged letters'
    }


    const options = {
        customMerge: (key, options) => {
          if (key === 'letters') {
            return mergeLetters
          }
        }
    }

    const expected = {
        letters: 'merged letters',
        people: {
            first: 'Smith',
            second: 'Bertson',
            third: 'Car'
        }
    }

	var actual = merge(target, source, options)
	t.deepEqual(actual, expected)
	t.end()
})

test('should merge correctly if custom merge is not a valid function', function(t) {
	var target = {
		letters: ['a', 'b'],
		people: {
			first: 'Alex',
			second: 'Bert',
		}
	}

	var source = {
		letters: ['c'],
		people: {
			first: 'Smith',
			second: 'Bertson',
			third: 'Car'
		}
	}

    const options = {
        customMerge: (key, options) => {
            return  false
        }
    }

    const expected = {
        letters: ['a', 'b', 'c'],
        people: {
            first: 'Smith',
            second: 'Bertson',
            third: 'Car'
        }
    }

	var actual = merge(target, source, options)
	t.deepEqual(actual, expected)
	t.end()

})

test('copy symbol keys in target that do not exist on the target', function(t) {
	var mySymbol = Symbol();
	var src = { [mySymbol]: 'value1' }
	var target = {}

	var res = merge(target, src)

	t.equal(res[mySymbol], 'value1')
	t.deepEqual(Object.getOwnPropertySymbols(res), Object.getOwnPropertySymbols(src))
	t.end()
})

test('copy symbol keys in target that do exist on the target', function(t) {
	var mySymbol = Symbol();
	var src = { [mySymbol]: 'value1' }
	var target = { [mySymbol]: 'wat'}

	var res = merge(target, src)

	t.equal(res[mySymbol], 'value1')
	t.end()
})

test('Falsey properties should be mergeable', function(t) {
	var uniqueValue = {}

	var target = {
		wat: false
	}

	var source = {
		wat: false
	}

	var customMergeWasCalled = false

	var result = merge(target, source, {
		isMergeableObject: function() {
			return true
		},
		customMerge: function() {
			return function() {
				customMergeWasCalled = true
				return uniqueValue
			}
		}
	})

	t.equal(result.wat, uniqueValue)
	t.ok(customMergeWasCalled, 'custom merge function was called')
	t.end()
})
