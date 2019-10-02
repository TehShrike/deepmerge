var merge = require('../')
var test = require('tape')

test('merging objects with own __proto__', function(t) {
	var user = {}
	var malicious = JSON.parse('{ "__proto__": { "admin": true } }')
	var mergedObject = merge(user, malicious)
	t.ok(mergedObject.__proto__.admin, 'nested properties should be merged')
	t.notOk(mergedObject.admin, 'the destination should have an unchanged prototype')
	t.end()
})