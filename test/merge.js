var merge = require('../')
var test = require('tap').test

test('add keys in target that do not exist at the root', function (t) {
    var src = { key1 : 'value1', key2 : 'value2' }
    target = {}
    
    merge(target, src)
    
    t.deepEqual(target, target)
    t.deepEqual(target, src)
    t.end()
})

test('merge existing simple keys in target at the roots', function (t) {
    var src = { key1 : 'changed', key2 : 'value2' }
    var target = { key1: 'value1', key3: 'value3' }
    
    var expected = {
        key1 : 'changed',
        key2 : 'value2',
        key3 : 'value3',
    }

    merge(target, src)

    t.deepEqual(target, expected)
    t.end()
})

test('merge nested objects into target', function (t) {
    var src = {
        key1 : {
            subkey1 : 'changed',
            subkey3 : 'added',
        }
    }
    var target = {
        key1 : {
            subkey1 : 'value1',
            subkey2 : 'value2',
        }
    }
    
    var expected = {
        key1 : {
            subkey1: 'changed',
            subkey2: 'value2',
            subkey3: 'added',
        }
    }

    merge(target, src)

    t.deepEqual(target, expected)
    t.end()
})

test('replace simple key with nested object in target', function (t) {
    var src = {
        key1 : {
            subkey1 : 'subvalue1',
            subkey2 : 'subvalue2',
        }
    }
    var target = { 
        key1 : 'value1',
        key2 : 'value2',
    }

    var expected = {
        key1 : {
            subkey1 : 'subvalue1',
            subkey2 : 'subvalue2',
        },
        key2 : 'value2',
    }

    merge(target, src)

    t.deepEqual(target, expected)
    t.end()
})

test('should replace object with simple key in target', function (t) {
    var src = { key1 : 'value1' }
    var target = {
        key1 : {
            subkey1: 'subvalue1',
            subkey2: 'subvalue2',
        },
        key2 : 'value2',
    }

    expected = { key1 : 'value1', key2 : 'value2' }

    merge(target, src)

    t.deepEqual(target, expected)
    t.end()
})
