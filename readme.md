# Regex

[![Build Status](https://travis-ci.org/tenbits/Regex.svg?branch=master)](https://travis-ci.org/tenbits/Regex)
[![NPM version](https://badge.fury.io/js/Regex.svg)](http://badge.fury.io/js/atma-regex)
[![Bower version](https://badge.fury.io/bo/Regex.svg)](http://badge.fury.io/bo/atma-regex)

JavaScript Regular Expression Library for NodeJS and Browsers.

### Features

- Named Groups `(?<name>expression)`, `(?'name'expression)`

- Named Backreferences `\k<name>`, `\k'name'`

- Named subexpressions `\g<name>`

- Comment Groups `(?# my comment)`

- Atomic Groups `(?>ab|c)`

- Positive-/Negative Lookbehind `(?<=expression)` `(?<!expression)`

- Anchors `\A`, `\Z`, `\z`, `\G`

- Possessive Quantifiers `++` `*+`

- Options
    + `x` : `(?x) \\d #comment`
    + `i` : `a(?i)b(?-i)c`

- Unicode

	+ `\x{HEX}` : `\x{200D}`
	+ `\p{CATEGORY}` : `\p{L}`


### Named Groups

```javascript
var rgx = new Regex('Name:\\s*(?<name>\\w+)');
var match = rgx.exec('My Name: Baz');
equals(match.groups.name, 'Baz');
```
