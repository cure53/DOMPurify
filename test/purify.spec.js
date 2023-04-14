import 'purify';
import './test-suite';
import tests from './fixtures/expect.mjs';

const xssTests = tests.filter(function (element) {
  if (/alert/.test(element.payload)) {
    return element;
  }
});

QUnit.module('DOMPurify src');

testSuite(DOMPurify, window, tests, xssTests);
