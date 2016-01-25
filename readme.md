# Regex

[![Build Status](https://travis-ci.org/tenbits/Regex.svg?branch=master)](https://travis-ci.org/tenbits/Regex)
[![npm version](https://badge.fury.io/js/atma-regex.svg)](https://badge.fury.io/js/atma-regex)
[![Bower version](https://badge.fury.io/bo/atma-regex.svg)](http://badge.fury.io/bo/atma-regex)

JavaScript Regular Expression Library for NodeJS and Browsers.

### Features

- Named Groups `(?<name>expression)`, `(?'name'expression)`

- Group index positions within the input

- Named Backreferences `\k<name>`, `\k'name'`

- Named subexpressions `\g<name>`

- Comment Groups `(?# my comment)`

- Atomic Groups `(?>ab|c)`

	_Temporarly disabled for better performance. The group is converted into JS none-captured group._

- Positive-/Negative Lookbehind `(?<=expression)` `(?<!expression)`

- Anchors `\A`, `\Z`, `\z`, `\G`

- Possessive Quantifiers `++` `*+`

- Options
    + `x` : `(?x) \\d #comment`
    + `i` : `a(?i)b(?-i)c(?i:hello)`

		_Temporarly disabled for better performance. The only first matched entry defines the flags for the expression_

- Unicode

	+ `\x{HEX}` : `\x{200D}`
	+ `\p{CATEGORY}` : `\p{L}`

- POSIX
	+ `[:ascii:]`, `[:^ascii:]`, etc

- Characters class
	+ intersection: `[a-z&&[^c]]`

- Character types
	+ (non-) hexadecimal : `\h`, `\H`


### Named Groups

```javascript
var rgx = new Regex('Name:\\s*(?<name>\\w+)');
var match = rgx.mach('My Name: Baz');
equals(match.groups.name, 'Baz');
```


# API

#### Npm/Bower

```bash
$ npm i atma-regex -s
$ bower install atma-regex --save
```

```javascript
var Regex = require('atma-regex');
var rgx = new Regex(pattern: string, flags: string);
```


#### `Regex::`


- `exec(input:string, index: number = this.lastMatch): JsMatch`
- `match(input:string, index: number = this.lastMatch): RegexMatch`
- `matches(input:string): RegexMatch[]`
- `lastIndex: number`


#### `JsMatch::`

[Javascript-compatible](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec) result object with additional properties:

- `groups:Object`: _key-value_. Named group values

#### `RegexMatch::`

- `value:string`: full match
- `index:number`: match index
- `groups?: RegexGroupMatch[]` 
- `groups[key]:string` : Named group value

#### `RegexGroupMatch::`

- `value:string`: full match
- `index:number`: match index


#### Sample:

```javascript
var Regex = require('atma-regex');
var rgx = new Regex('(?<=a)([pr])');
var match = rgx.match('-p--apa');

console.log(`Matches '${match.value}' at pos #${match.index}`);
```

[Live example](https://tonicdev.com/npm/atma-regex)

_See more examples in tests_


---
:copyright: MIT









