deepmerge
=========

> ~554B gzipped, ~1.10KiB minified

Merge the enumerable attributes of two objects deeply.

example
=======

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

methods
=======

```
var merge = require('deepmerge')
```

merge(x, y, [options])
-----------

Merge two objects `x` and `y` deeply, returning a new merged object with the
elements from both `x` and `y`.

If an element at the same key is present for both `x` and `y`, the value from
`y` will appear in the result.

Merging creates a new object, so that neither `x` or `y` are be modified.

merge.all(arrayOfObjects, [options])
-----------

Merges any number of objects into a single result object.

```js
var x = { foo: { bar: 3 } }
var y = { foo: { baz: 4 } }
var z = { bar: 'yay!' }

var expected = { foo: { bar: 3, baz: 4 }, bar: 'yay!' }

merge.all([x, y, z]) // => expected
```

### options

#### arrayMerge

The merge will also concatenate arrays and merge array values by default.

However, there are nigh-infinite valid ways to merge arrays, and you may want to supply your own.  You can do this by passing an `arrayMerge` function as an option.

```js
function overwriteMerge(destinationArray, sourceArray, options) {
	return sourceArray
}
merge(
	[1, 2, 3],
	[3, 2, 1],
	{ arrayMerge: overwriteMerge }
) // => [3, 2, 1]
```

To prevent arrays from being merged:

```js
const dontMerge = (destination, source) => source
const output = merge({ coolThing: [1,2,3] }, { coolThing: ['a', 'b', 'c'] }, { arrayMerge: dontMerge })
output // => { coolThing: ['a', 'b', 'c'] }
```

To use the old (pre-version-2.0.0) array merging algorithm, pass in this function:

```js
function oldArrayMerge(target, source, optionsArgument) {
	var destination = target.slice()
	source.forEach(function(e, i) {
		if (typeof destination[i] === 'undefined') {
			destination[i] = cloneIfNecessary(e, optionsArgument)
		} else if (isMergeableObject(e)) {
			destination[i] = deepmerge(target[i], e, optionsArgument)
		} else if (target.indexOf(e) === -1) {
			destination.push(cloneIfNecessary(e, optionsArgument))
		}
	})
	return destination
}
```

#### clone

*Deprecated.*

Defaults to `true`.

If `clone` is `false` then child objects will be copied directly instead of being cloned.  This was the default behavior before version 2.x.

install
=======

With [npm](http://npmjs.org) do:

```sh
npm install deepmerge
```

Just want to download the file without using any package managers/bundlers?  [Download the UMD version from unpkg.com](https://unpkg.com/deepmerge/dist/umd.js).

test
====

With [npm](http://npmjs.org) do:

```sh
npm test
```

license
=======

MIT
