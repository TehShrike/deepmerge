var merge = require('../')
var test = require('tap').test

test('throw error if first argument is not an array', function(t) {
  t.throws(merge.all.bind(null, { example: true }, { another: '2' }), TypeError)
})

test('throw error if first argument is an array with least than two elements', function(t) {
  t.throws(merge.all.bind(null, [{ example: true }]), TypeError)
})

test('execute correctly if options object were not passed', function(t) {
  var arrayToMerge = [{ example: true }, { another: '123' }]
  t.doesNotThrow(merge.all.bind(null, arrayToMerge))
})

test('execute correctly if options object were passed', function(t) {
  var arrayToMerge = [{ example: true }, { another: '123' }]
  t.doesNotThrow(merge.all.bind(null, arrayToMerge, { clone:true }))
})
