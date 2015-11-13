# Regex

Better JavaScript Regular Expression Library

### Features

- Named Groups `(?<name>expression)`, `(?'name'expression)`
    
    ```regex
    var rgx = new Regex('Name:\\s*(?<name>\\w+)');
    var match = rgx.exec('My Name: Baz');
    equals(match.groups.name, 'Baz');
    ```

- Options
    + `x` : `(?x) \\d #comment`
    + `i` : `a(?i)b(?-i)c`
        
