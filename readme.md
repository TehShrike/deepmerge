# deepmerge

Merges the enumerable attributes of two or more objects deeply.

> UMD bundle is 567B minified+gzipped


### Migration from 1.x to 2.0.0

[***Check out the changes from version 1.x to 2.0.0***](https://github.com/KyleAMathews/deepmerge/blob/master/changelog.md#200)

For the legacy array element-merging algorithm, see [the `arrayMerge` option below](#arraymerge).


### Webpack bug

If you have `require('deepmerge')` (as opposed to `import merge from 'deepmerge'`) anywhere in your codebase, Webpack 3 and 4 have a bug that [breaks bundling](https://github.com/webpack/webpack/issues/6584).

If you see `Error: merge is not a function`, add this alias to your Webpack config:

```
alias: {
	deepmerge$: path.resolve(__dirname, 'node_modules/deepmerge/dist/umd.js'),
}
```


## Getting Started

### Example Usage
<!--js
var merge = require('./')
-->

```js
var x = {
	foo: { bar: 3 },
	array: [{
		does: 'work',
		too: [ 1, 2, 3 ]
	}]
}

var y = {
	foo: { baz: 4 },
	quux: 5,
	array: [{
		does: 'work',
		too: [ 4, 5, 6 ]
	}, {
		really: 'yes'
	}]
}

var expected = {
	foo: {
		bar: 3,
		baz: 4
	},
	array: [{
		does: 'work',
		too: [ 1, 2, 3 ]
	}, {
		does: 'work',
		too: [ 4, 5, 6 ]
	}, {
		really: 'yes'
	}],
	quux: 5
}

merge(x, y) // => expected
```


### Installation

With [npm](http://npmjs.org) do:

```sh
npm install deepmerge
```

deepmerge can be used directly in the browser without the use of package managers/bundlers as well:  [UMD version from unpkg.com](https://unpkg.com/deepmerge/dist/umd.js).


### Includes

CommonJS:
```
var merge = require('deepmerge')
```

ES Modules:
```
import merge from 'deepmerge'
```


# API


## `merge(x, y, [options])`

Merge two objects `x` and `y` deeply, returning a new merged object with the
elements from both `x` and `y`.

If an element at the same key is present for both `x` and `y`, the value from
`y` will appear in the result.

Merging creates a new object, so that neither `x` or `y` is modified.

**Note:** by default, arrays are concatenated rather than replacing the array values of `x` with `y`. If you want to replace the values then see `overwriteMerge` documentation in the options section below.


## `merge.all(arrayOfObjects, [options])`

Merges any number of objects into a single result object.

```js
var x = { foo: { bar: 3 } }
var y = { foo: { baz: 4 } }
var z = { bar: 'yay!' }

var expected = { foo: { bar: 3, baz: 4 }, bar: 'yay!' }

merge.all([x, y, z]) // => expected
```


## Options

### `arrayMerge: overwriteMerge`

If you want to overwrite the existing array values rather than concatenating them, such as overwriting defaults then use `overwriteMerge`

```js
const overwriteMerge = (destinationArray, sourceArray, options) => sourceArray

merge(
	[{ a: false }],
	[{ a: true }, { b: true }, 'ah yup'],
	{ arrayMerge: overwriteMerge }
) // => [{ a: true, b: true }, 'ah yup']
```

### `arrayMerge: dontMerge`

If you want to prevent arrays inside of objects from being merged, then use `dontMerge`

```js
const dontMerge = (destination, source) => source

merge(
	{ coolThing: [1, 2, 3] },
	{ coolThing: ['a', 'b', 'c'] },
	{ arrayMerge: dontMerge }
) // => { coolThing: ['a', 'b', 'c'] }
```

### `arrayMerge: legacyArrayMerge`

To use the legacy (pre-version-2.0.0) array merging algorithm, use the following:

```js
const emptyTarget = value => Array.isArray(value) ? [] : {}
const clone = (value, options) => merge(emptyTarget(value), value, options)

function legacyArrayMerge(target, source, options) {
	const destination = target.slice()

	source.forEach(function(e, i) {
		if (typeof destination[i] === 'undefined') {
			const cloneRequested = options.clone !== false
			const shouldClone = cloneRequested && options.isMergeableObject(e)
			destination[i] = shouldClone ? clone(e, options) : e
		} else if (options.isMergeableObject(e)) {
			destination[i] = merge(target[i], e, options)
		} else if (target.indexOf(e) === -1) {
			destination.push(e)
		}
	})
	return destination
}

merge(
	[{ a: true }],
	[{ b: true }, 'ah yup'],
	{ arrayMerge: legacyArrayMerge }
) // => [{ a: true, b: true }, 'ah yup']
```

### `arrayMerge: customFunction`

If you want to supply your own custom method then pass it as an option to `arrayMerge`

```js
const customFunction = ...

merge(x, y, { arrayMerge: customFunction })
```

### `isMergeableObject`

By default, deepmerge clones every property from almost every kind of object.

You may not want this, if your objects are of special types, and you want to copy the whole object instead of just copying its properties.

You can accomplish this by passing in a function for the `isMergeableObject` option.

If you only want to clone properties of plain objects, and ignore all "special" kinds of instantiated objects, you probably want to drop in [`is-plain-object`](https://github.com/jonschlinkert/is-plain-object).

```js
const isPlainObject = require('is-plain-object')

function SuperSpecial() {
	this.special = 'oh yeah man totally'
}

const instantiatedSpecialObject = new SuperSpecial()

const target = {
	someProperty: {
		cool: 'oh for sure'
	}
}

const source = {
	someProperty: instantiatedSpecialObject
}

const defaultOutput = merge(target, source)

defaultOutput.someProperty.cool // => 'oh for sure'
defaultOutput.someProperty.special // => 'oh yeah man totally'
defaultOutput.someProperty instanceof SuperSpecial // => false

const customMergeOutput = merge(target, source, {
	isMergeableObject: isPlainObject
})

customMergeOutput.someProperty.cool // => undefined
customMergeOutput.someProperty.special // => 'oh yeah man totally'
customMergeOutput.someProperty instanceof SuperSpecial // => true
```


### `clone`

*Deprecated.*

Defaults to `true`.

If `clone` is `false` then child objects will be copied directly instead of being cloned.  This was the default behavior before version 2.x.


# Testing

With [npm](http://npmjs.org) do:

```sh
npm test
```


# License

MIT
