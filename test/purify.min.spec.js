const DOMPurify = require('purify.min');
const testSuite = require('test-suite');
const tests = require('fixtures/expect');
const xssTests = tests.filter( function( element ) {
  if ( /alert/.test( element.payload ) ) { return element; }
});

QUnit.module('DOMPurify dist');

testSuite(DOMPurify, window, tests, xssTests);
