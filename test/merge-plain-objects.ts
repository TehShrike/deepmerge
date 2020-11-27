import deepmerge from "deepmerge"
import test from "tape"

test(`plain objects are merged by default and can be cloned`, (t) => {
	const input = {
		newObject: new Object(),
		objectLiteral: { a: 123 },
	}
	const output = deepmerge({}, input, { clone: true })

	t.deepEqual(output.newObject, input.newObject)
	t.notEqual(output.newObject, input.newObject)
	t.deepEqual(output.objectLiteral, input.objectLiteral)
	t.notEqual(output.objectLiteral, input.objectLiteral)

	t.end()
})

test(`instantiated objects are copied by reference with clone=true`, (t) => {
	const input = {
		date: new Date(),
		error: new Error(),
		regex: /regex/,
	}
	const output = deepmerge({}, input, { clone: true })

	t.equal(output.date, input.date)
	t.equal(output.error, input.error)
	t.equal(output.regex, input.regex)

	t.end()
})


