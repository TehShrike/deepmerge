var merge = require('../')
const moment = require('moment')
var test = require('tap').test

test('moment should copy correctly in an array', function(t) {
	var monday = moment('2016-09-27T01:08:12.761Z')
	var tuesday = moment('2016-09-28T01:18:12.761Z')

	var target = [ monday, 'dude' ]
	var source = [ tuesday, 'lol' ]

	var expected = [ monday, 'dude', tuesday, 'lol' ]
	var actual = merge(target, source)

	t.deepEqual(actual, expected)
	t.end()
})

test('moment with options.isMergeableObject', function(t) {
	var monday = moment('2016-09-27T01:08:12.761Z')
	var tuesday = moment('2016-09-28T01:18:12.761Z')

	var target = {
		date: monday
	}
	var source = {
		date: tuesday
	}

	let options = {
		isMergeableObject(value, isMergeableObject) {
			let bool;

			if (bool = moment.isMoment(value)) {
				return false;
			}
		}
	}

	var expected = {
		date: tuesday
	}
	var actual = merge(target, source, options)

	t.deepEqual(actual, expected)
	t.deepEqual(actual.date.get('minutes'), 18)
	t.end()
})

test('moment with options.isMergeableObject v2', function(t) {
	var monday = moment('2016-09-27T01:08:12.761Z')
	var tuesday = moment('2016-09-28T01:18:12.761Z')

	var target = {
		date: monday
	}
	var source = {
		date: tuesday
	}

	let options = {
		isMergeableObject(value, isMergeableObject) {
			let bool;

			if (bool = moment.isMoment(value)) {
				return false;
			}

			return isMergeableObject(value)
		}
	}

	var expected = {
		date: tuesday
	}
	var actual = merge(target, source, options)

	t.deepEqual(actual, expected)
	t.deepEqual(actual.date.get('minutes'), 18)
	t.end()
})
