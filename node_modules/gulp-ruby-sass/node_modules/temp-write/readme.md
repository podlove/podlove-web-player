# temp-write [![Build Status](https://travis-ci.org/sindresorhus/temp-write.svg?branch=master)](https://travis-ci.org/sindresorhus/temp-write)

> Write String/Buffer to a random temp file


## Install

```bash
$ npm install --save temp-write
```


## Usage

```js
var fs = require('fs');
var tempWrite = require('temp-write');

var filepath = tempWrite.sync('unicorn');
//=> /var/folders/_1/tk89k8215ts0rg0kmb096nj80000gn/T/4049f192-43e7-43b2-98d9-094e6760861b

fs.readFileSync(filepath, 'utf8');
//=> unicorn


tempWrite.sync('unicorn', 'pony.png');
//=> /var/folders/_1/tk89k8215ts0rg0kmb096nj80000gn/T/4049f192-43e7-43b2-98d9-094e6760861b/pony.png

tempWrite.sync('unicorn', 'rainbow/cake/pony.png');
//=> /var/folders/_1/tk89k8215ts0rg0kmb096nj80000gn/T/4049f192-43e7-43b2-98d9-094e6760861b/rainbow/cake/pony.png
```


## API

### tempWrite(input, [filepath], callback)

#### input

*Required*  
Type: `String`|`Buffer`

#### filepath

Type: `String`  
Example: `'img.png'`, `'foo/bar/baz.png'`

Optionally supply a filepath which is appended to the random path.

#### callback(err, filepath)

*Required*  
Type: `Function`

### tempWrite.sync(input)

Type: `String`|`Buffer`  
Returns: the filepath


## License

[MIT](http://opensource.org/licenses/MIT) © [Sindre Sorhus](http://sindresorhus.com)
