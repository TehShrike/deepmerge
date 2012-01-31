merge = (target, src) ->
	for key, value of src
		unless value instanceof Object
			target[key] = value
		else
			target[key] = {} if not target[key] or target[key] not instanceof Object
			merge target[key], value

module.exports = merge