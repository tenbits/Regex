# Regex

[![Build Status](https://travis-ci.org/tenbits/Regex.svg?branch=master)](https://travis-ci.org/tenbits/Regex)
[![NPM version](https://badge.fury.io/js/Regex.svg)](http://badge.fury.io/js/atma-regex)
[![Bower version](https://badge.fury.io/bo/Regex.svg)](http://badge.fury.io/bo/atma-regex)


Better JavaScript Regular Expression Library

### Features

- Named Groups `(?<name>expression)`, `(?'name'expression)`
    
    ```javascript
    var rgx = new Regex('Name:\\s*(?<name>\\w+)');
    var match = rgx.exec('My Name: Baz');
    equals(match.groups.name, 'Baz');
    ```

- Options
    + `x` : `(?x) \\d #comment`
    + `i` : `a(?i)b(?-i)c`
        
