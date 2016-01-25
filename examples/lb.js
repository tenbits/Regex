var Regex = require('atma-regex');
var rgx = new Regex('(?<=a)([pr])');
var match = rgx.match('-p--apa');

console.log(`Matches '${match.value}' at pos #${match.index}`);