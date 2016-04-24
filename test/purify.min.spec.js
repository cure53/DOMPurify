var
  DOMPurify = require('purify.min'),
  testSuite = require('test-suite'),
  tests = require('fixtures/expect'),
  xssTests = tests.filter( function( element ) {
    if ( /alert/.test( element.payload ) ) { return element; }
  });

QUnit.module('DOMPurify dist');
testSuite(DOMPurify, window, tests, xssTests);
