import DOMPurify from 'purify.min';
import testSuite from './test-suite.js';
import tests from './fixtures/expect.mjs';

const xssTests = tests.filter(function (element) {
  if (/alert/.test(element.payload)) {
    return element;
  }
});

QUnit.module('DOMPurify dist');

testSuite(QUnit.test, DOMPurify, window, tests, xssTests);
