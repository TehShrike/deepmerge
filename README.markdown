deepmerge
=========

Merge the enumerable attributes of two objects deeply.

example
=======

```js
var util = require('util')
var merge = require('deepmerge')

var x = { foo: { bar: 3 },
  array: [ { does: 'work', too: [ 1, 2, 3 ] } ] }
var y = { foo: { baz: 4 },
  quux: 5,
  array: [ { does: 'work', too: [ 4, 5, 6 ] }, { really: 'yes' } ] }

console.log(util.inspect(merge(x, y), false, null))
```

output:

```js
{ foo: { bar: 3, baz: 4 },
  array: [ { does: 'work', too: [ 1, 2, 3, 4, 5, 6 ] }, { really: 'yes' } ],
  quux: 5 }
```

methods
=======

var merge = require('deepmerge')

merge(target, source[, options])
-----------

Merge two objects `target` and `source` deeply, returning a new merged object with the
elements from both `target` and `source`.

If an element at the same key is present for both `target` and `source`, the value from
`source` will appear in the result.

The merge is immutable, so neither `target` nor `source` will be modified.

The merge will also merge arrays and array values.

options
=======

`options` is an optional parameter.

```js
options: {
  array: 'both' // to specify the behavior of array merging, possible values (both, target, source)
}
```

install
=======

With [npm](http://npmjs.org) do:

```
npm install deepmerge
```

For the browser, you can install with [bower](http://bower.io/):

```
bower install deepmerge
```

test
====

With [npm](http://npmjs.org) do:

```
npm test
```
