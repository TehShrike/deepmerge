merge = require '../../lib/merge'

describe 'merge', ->
	
	it 'should add keys in target that do not exist at the root', ->
		src =
			key1: 'value1'
			key2: 'value2'
		target = {}


		merge target, src

		expect(target).toEqual(target)
	
	it 'should merge existing simple keys in target at the roots', ->
		src = 
			key1: 'changed'
			key2: 'value2'
		target =
			key1: 'value1'
			key3: 'value3'
		
		expected =
			key1: 'changed'
			key2: 'value2'
			key3: 'value3'

		merge target, src

		expect(target).toEqual(expected)
	
	it 'should merge nested objects into target', ->
		src =
			key1:
				subkey1: 'changed'
				subkey3: 'added'
		target =
			key1:
				subkey1: 'value1'
				subkey2: 'value2'

		expected =
			key1:
				subkey1: 'changed'
				subkey2: 'value2'
				subkey3: 'added'

		merge target, src

		expect(target).toEqual(expected)
	