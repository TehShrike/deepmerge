import { deepmerge as merge } from "deepmerge"
import test from "tape"

test(`plain objects are merged by default`, (t) => {
	const input = {
		newObject: new Object(),
		objectLiteral: { a: 123 },
	}
	const output = merge({}, input, { clone: false })

	t.deepEqual(output.newObject, input.newObject)
	t.equal(output.newObject, input.newObject)
	t.deepEqual(output.objectLiteral, input.objectLiteral)
	t.equal(output.objectLiteral, input.objectLiteral)

	t.end()
})

test(`instantiated objects are copied by reference`, (t) => {
	const input = {
		date: new Date(),
		error: new Error(),
		regex: /regex/,
	}
	const output = merge({}, input)

	t.equal(output.date, input.date)
	t.equal(output.error, input.error)
	t.equal(output.regex, input.regex)

	t.end()
})


