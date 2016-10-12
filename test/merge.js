var merge = require('../')
var test = require('tap').test

test('add keys in target that do not exist at the root', function (t) {
    var src = { key1: 'value1', key2: 'value2' }
    target = {}

    var res = merge(target, src)

    t.deepEqual(target, {}, 'merge should be immutable')
    t.deepEqual(res, src)
    t.end()
})

test('merge existing simple keys in target at the roots', function (t) {
    var src = { key1: 'changed', key2: 'value2' }
    var target = { key1: 'value1', key3: 'value3' }

    var expected = {
        key1: 'changed',
        key2: 'value2',
        key3: 'value3'
    }

    t.deepEqual(target, { key1: 'value1', key3: 'value3' })
    t.deepEqual(merge(target, src), expected)
    t.end()
})

test('merge nested objects into target', function (t) {
    var src = {
        key1: {
            subkey1: 'changed',
            subkey3: 'added'
        }
    }
    var target = {
        key1: {
            subkey1: 'value1',
            subkey2: 'value2'
        }
    }

    var expected = {
        key1: {
            subkey1: 'changed',
            subkey2: 'value2',
            subkey3: 'added'
        }
    }

    t.deepEqual(target, {
        key1: {
            subkey1: 'value1',
            subkey2: 'value2'
        }
    })
    t.deepEqual(merge(target, src), expected)
    t.end()
})

test('replace simple key with nested object in target', function (t) {
    var src = {
        key1: {
            subkey1: 'subvalue1',
            subkey2: 'subvalue2'
        }
    }
    var target = {
        key1: 'value1',
        key2: 'value2'
    }

    var expected = {
        key1: {
            subkey1: 'subvalue1',
            subkey2: 'subvalue2'
        },
        key2: 'value2'
    }

    t.deepEqual(target, { key1: 'value1', key2: 'value2' })
    t.deepEqual(merge(target, src), expected)
    t.end()
})

test('should add nested object in target', function(t) {
    var src = {
        "b": {
            "c": {}
        }
    }

    var target = {
        "a": {}
    }

    var expected = {
        "a": {},
        "b": {
            "c": {}
        }
    }

    t.deepEqual(merge(target, src), expected)
    t.end()
})

test('should clone source and target', function(t) {
    var src = {
        "b": {
            "c": "foo"
        }
    }

    var target = {
        "a": {
            "d": "bar"
        }
    }

    var expected = {
        "a": {
            "d": "bar"
        },
        "b": {
            "c": "foo"
        }
    }

    var merged = merge(target, src, {clone: true})

    t.deepEqual(merged, expected)

    t.notEqual(merged.a, target.a)
    t.notEqual(merged.b, src.b)

    t.end()
})

test('should not clone source and target', function(t) {
    var src = {
        "b": {
            "c": "foo"
        }
    }

    var target = {
        "a": {
            "d": "bar"
        }
    }

    var expected = {
        "a": {
            "d": "bar"
        },
        "b": {
            "c": "foo"
        }
    }

    var merged = merge(target, src)
    t.equal(merged.a, target.a)
    t.equal(merged.b, src.b)

    t.end()
})

test('should replace object with simple key in target', function (t) {
    var src = { key1: 'value1' }
    var target = {
        key1: {
            subkey1: 'subvalue1',
            subkey2: 'subvalue2'
        },
        key2: 'value2'
    }

    var expected = { key1: 'value1', key2: 'value2' }

    t.deepEqual(target, {
        key1: {
            subkey1: 'subvalue1',
            subkey2: 'subvalue2'
        },
        key2: 'value2'
    })
    t.deepEqual(merge(target, src), expected)
    t.end()
})

test('should work on simple array', function (t) {
    var src = ['one', 'three']
    var target = ['one', 'two']

    var expected = ['one', 'two', 'three']

    t.deepEqual(target, ['one', 'two'])
    t.deepEqual(merge(target, src), expected)
    t.ok(Array.isArray(merge(target, src)))
    t.end()
})

test('should work on another simple array', function(t) {
    var target = ["a1","a2","c1","f1","p1"];
    var src = ["t1","s1","c2","r1","p2","p3"];

    var expected = ["a1", "a2", "c1", "f1", "p1", "t1", "s1", "c2", "r1", "p2", "p3"]
    t.deepEqual(target, ["a1", "a2", "c1", "f1", "p1"])
    t.deepEqual(merge(target, src), expected)
    t.ok(Array.isArray(merge(target, src)))
    t.end()
})

test('should work on array properties', function (t) {
    var src = {
        key1: ['one', 'three'],
        key2: ['four']
    }
    var target = {
        key1: ['one', 'two']
    }

    var expected = {
        key1: ['one', 'two', 'three'],
        key2: ['four']
    }

    t.deepEqual(target, {
        key1: ['one', 'two']
    })

    t.deepEqual(merge(target, src), expected)
    t.ok(Array.isArray(merge(target, src).key1))
    t.ok(Array.isArray(merge(target, src).key2))
    t.end()
})

test('should work on array properties with clone option', function (t) {
    var src = {
        key1: ['one', 'three'],
        key2: ['four']
    }
    var target = {
        key1: ['one', 'two']
    }

    var expected = {
        key1: ['one', 'two', 'three'],
        key2: ['four']
    }

    t.deepEqual(target, {
        key1: ['one', 'two']
    })
    var merged = merge(target, src, {clone: true})
    t.notEqual(merged.key1, src.key1)
    t.notEqual(merged.key1, target.key1)
    t.notEqual(merged.key2, src.key2)
    t.end()
})

test('should work on array of objects', function (t) {
    var src = [
        { key1: ['one', 'three'], key2: ['one'] },
        { key3: ['five'] }
    ]
    var target = [
        { key1: ['one', 'two'] },
        { key3: ['four'] }
    ]

    var expected = [
        { key1: ['one', 'two', 'three'], key2: ['one'] },
        { key3: ['four', 'five'] }
    ]

    t.deepEqual(target, [
        { key1: ['one', 'two'] },
        { key3: ['four'] }
    ])
    t.deepEqual(merge(target, src), expected)
    t.ok(Array.isArray(merge(target, src)), 'result should be an array')
    t.ok(Array.isArray(merge(target, src)[0].key1), 'subkey should be an array too')

    t.end()
})

test('should work on array of objects with clone option', function (t) {
    var src = [
        { key1: ['one', 'three'], key2: ['one'] },
        { key3: ['five'] }
    ]
    var target = [
        { key1: ['one', 'two'] },
        { key3: ['four'] }
    ]

    var expected = [
        { key1: ['one', 'two', 'three'], key2: ['one'] },
        { key3: ['four', 'five'] }
    ]

    t.deepEqual(target, [
        { key1: ['one', 'two'] },
        { key3: ['four'] }
    ])
    var merged = merge(target, src, {clone: true})
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

test('should work on arrays of nested objects', function(t) {
    var target = [
        { key1: { subkey: 'one' }}
    ]

    var src = [
        { key1: { subkey: 'two' }},
        { key2: { subkey: 'three' }}
    ]

    var expected = [
        { key1: { subkey: 'two' }},
        { key2: { subkey: 'three' }}
    ]

    t.deepEqual(merge(target, src), expected)
    t.end()
})

test('should treat regular expressions like primitive values', function (t) {
    var target = { key1: /abc/ }
    var src = { key1: /efg/ }
    var expected = { key1: /efg/ }

    t.deepEqual(merge(target, src), expected)
    t.deepEqual(merge(target, src).key1.test('efg'), true)
    t.end()
})

test('should treat regular expressions like primitive values and should not'
    + ' clone even with clone option',
    function (t) {
        var target = { key1: /abc/ }
        var src = { key1: /efg/ }
        var expected = { key1: /efg/ }

        var output = merge(target, src, {clone: true})

        t.equal(output.key1, src.key1)
        t.end()
    }
)

test('should treat dates like primitives', function(t) {
    var monday = new Date('2016-09-27T01:08:12.761Z')
    var tuesday = new Date('2016-09-28T01:18:12.761Z')

    var target = {
        key: monday
    }
    var source = {
        key: tuesday
    }

    var expected = {
        key: tuesday
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
        key: monday
    }
    var source = {
        key: tuesday
    }

    var expected = {
        key: tuesday
    }
    var actual = merge(target, source, {clone: true})

    t.equal(actual.key, tuesday)
    t.end()
})

test('should work on array with null in it', function(t) {
    var target = []

    var src = [null]

    var expected = [null]

    t.deepEqual(merge(target, src), expected)
    t.end()
})

test('should clone array\'s element if it is object', function(t) {
    var a = { key: 'yup' }
    var target = []
    var source = [a]
    var expected = [{key: 'yup'}]

    var output = merge(target, source, {clone: true})

    t.notEqual(output[0], a)
    t.equal(output[0].key, 'yup')
    t.end()
})
test('should overwrite values when property is initialised but undefined', function(t) {
    var target1 = { value: [] }
    var target2 = { value: null }
    var target3 = { value: 2 }

    var src = { value: undefined }

    var expected = { value: undefined }

    function hasUndefinedProperty(o) {
        t.ok(o.hasOwnProperty('value'))
        t.type(o.value, 'undefined')
    }

    hasUndefinedProperty(merge(target1, src))
    hasUndefinedProperty(merge(target2, src))
    hasUndefinedProperty(merge(target3, src))

    t.end()
})

test('null should be equal to null in an array', function(t) {
    var target = [null, 'dude']
    var source = [null, 'lol']

    var expected = [null, 'dude', 'lol']
    var actual = merge(target, source)

    t.deepEqual(actual, expected)
    t.end()
})

test('dates in an array should be compared correctly', function(t) {
    var monday = new Date('2016-09-27T01:08:12.761Z')

    var target = [monday, 'dude']
    var source = [monday, 'lol']

    var expected = [monday, 'dude', 'lol']
    var actual = merge(target, source)

    t.deepEqual(actual, expected)
    t.end()
})

test('dates should copy correctly in an array', function(t) {
    var monday = new Date('2016-09-27T01:08:12.761Z')
    var tuesday = new Date('2016-09-28T01:18:12.761Z')

    var target = [monday, 'dude']
    var source = [tuesday, 'lol']

    var expected = [monday, 'dude', tuesday, 'lol']
    var actual = merge(target, source)

    t.deepEqual(actual, expected)
    t.end()
})
