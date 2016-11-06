var merge = require('../')
var test = require('tap').test

test('throw error if first argument is not an array', function(t) {
  t.throws(merge.all.bind(null, { example: true }, { another: '2' }), Error)
})

test('throw error if first argument is an array with least than two elements', function(t) {
  t.throws(merge.all.bind(null, [{ example: true }]), Error)
})

test('execute correctly if options object were not passed', function(t) {
  var arrayToMerge = [{ example: true }, { another: '123' }]
  t.doesNotThrow(merge.all.bind(null, arrayToMerge))
})

test('execute correctly if options object were passed', function(t) {
  var arrayToMerge = [{ example: true }, { another: '123' }]
  t.doesNotThrow(merge.all.bind(null, arrayToMerge, { clone:true }))
})

test('invoke merge on every item in array should result with all props', function(t) {
  var firstObject = { first: true }
  var secondObject = { second: false }
  var thirdObject = { third: 123 }
  var fourthObject = { fourth: 'some string' }

  var mergedObject = merge.all([firstObject, secondObject, thirdObject, fourthObject])

  t.ok(mergedObject.first === true)
  t.ok(mergedObject.second === false)
  t.ok(mergedObject.third === 123)
  t.ok(mergedObject.fourth === 'some string')
})

test('invoke merge on every item in array with clone should change object references', function(t) {
  var firstObject = { link: { example: 123 } }
  var secondObject = { link: { example: true } }
  var thirdObject = { link: { example: 'string' } }

  var mergedObject = merge.all([firstObject, secondObject, thirdObject], { clone: true })

  t.ok(mergedObject.link !== firstObject.link)
  t.ok(mergedObject.link !== secondObject.link)
  t.ok(mergedObject.link !== thirdObject.link)
})
