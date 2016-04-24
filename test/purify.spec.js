var
  DOMPurify = require('purify'),
  testSuite = require('test-suite'),
  tests = require('fixtures/expect'),
  xssTests = tests.filter( function( element ) {
    if ( /alert/.test( element.payload ) ) { return element; }
  });

QUnit.module('DOMPurify src');
testSuite(DOMPurify, window, tests, xssTests);
