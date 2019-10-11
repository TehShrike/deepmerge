var merge = require('../')
var test = require('tape')

test('the default isMergeableObject function works as expected', function(t) {
	var someReactElement = {
		$$typeof: Symbol.for('react.element')
	}
	var defaultIsMergeable = null
	merge([], [], {
		arrayMerge: function (a, b, options) {
			defaultIsMergeable = options.isMergeableObject
		}
	})

	t.equal(typeof defaultIsMergeable, 'function')

	t.equal(defaultIsMergeable(null), false, 'null is not mergeable')
	t.equal(defaultIsMergeable(new RegExp('wat')), false, 'regex is not mergeable')
	t.equal(defaultIsMergeable(undefined), false, 'undefined is not mergeable')
	t.equal(defaultIsMergeable(new Date()), false, 'date is not mergeable')

	t.equal(defaultIsMergeable({}), true, 'object is mergeable')
	t.equal(defaultIsMergeable([]), true, 'array is mergeable')
	t.equal(defaultIsMergeable(new Object()), true, 'object is mergeable')
	t.equal(defaultIsMergeable(someReactElement), true, 'react element is mergeable')
	t.end()

})
