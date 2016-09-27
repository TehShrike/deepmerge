deepmerge
=========

Merge the enumerable attributes of two objects deeply.

example
=======

<!--js
var merge = require('./')
-->

```js
var x = { foo: { bar: 3 },
  array: [ { does: 'work', too: [ 1, 2, 3 ] } ] }
var y = { foo: { baz: 4 },
  quux: 5,
  array: [ { does: 'work', too: [ 4, 5, 6 ] }, { really: 'yes' } ] }

var expected = { foo: { bar: 3, baz: 4 },
  array: [ { does: 'work', too: [ 1, 2, 3, 4, 5, 6 ] }, { really: 'yes' } ],
  quux: 5 }

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

The merge is immutable, so neither `x` nor `y` will be modified.

The merge will also merge arrays and array values by default.  However, there are nigh-infinite valid ways to merge arrays, and you may want to supply your own.  You can do this by passing an `arrayMerge` function as an option.

```js
function concatMerge(destinationArray, sourceArray, mergeOptions) {
	return destinationArray.concat(sourceArray)
}
merge([1, 2, 3], [1, 2, 3], { arrayMerge: concatMerge }) // => [1, 2, 3, 1, 2, 3]
```

install
=======

With [npm](http://npmjs.org) do:

```sh
npm install deepmerge
```

test
====

With [npm](http://npmjs.org) do:

```sh
npm test
```

license
=======

MIT
