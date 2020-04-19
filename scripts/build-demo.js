/* jshint globalstrict:true, node:true */
'use strict';

var he = require('he');
var fs = require('fs');
var tests = JSON.parse(fs.readFileSync('./test/expect.json', 'utf-8'));

var allTests = tests
  .reduce(function (previousValue, currentValue) {
    return previousValue + '\n' + currentValue.payload;
  }, '')
  .trim();
var allTestsEscaped = he.encode(allTests);

var template = fs.readFileSync('./demo/index.tpl', 'utf-8');
// Poor man’s templating engine, aka. `String#replace`:
var result = template.replace(/<%- examples %>/, allTestsEscaped);

fs.writeFileSync('./demo/index.html', result);
