const DOMPurify = require('purify');
const testSuite = require('test-suite');
const tests = require('fixtures/expect');
const xssTests = tests.filter( function( element ) {
  if ( /alert/.test( element.payload ) ) { return element; }
});

QUnit.module('DOMPurify src');

testSuite(DOMPurify, window, tests, xssTests);
