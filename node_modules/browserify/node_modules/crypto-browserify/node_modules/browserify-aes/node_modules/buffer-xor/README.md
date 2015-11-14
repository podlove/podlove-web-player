# buffer-xor

[![TRAVIS](https://secure.travis-ci.org/dcousens/buffer-xor.png)](http://travis-ci.org/dcousens/PROJECTNAME)
[![NPM](http://img.shields.io/npm/v/buffer-xor.svg)](https://www.npmjs.org/package/PROJECTNAME)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)


## Example

``` javascript
var xor = require("buffer-xor")
var a = new Buffer('00ff0f', 'hex')
var b = new Buffer('f0f0', 'hex')

console.log(xor(a, b))
// => <Buffer f0 0f>
```

Or for those seeking those few extra cycles, perform the operation inline:
``` javascript
var xorInline = require("buffer-xor/inline")
var a = new Buffer('00ff0f', 'hex')
var b = new Buffer('f0f0', 'hex')

console.log(xorInline(a, b))
// => <Buffer f0 0f>

// See that a has been mutated
console.log(a)
// => <Buffer f0 0f 0f>
```


## License

This library is free and open-source software released under the MIT license.
