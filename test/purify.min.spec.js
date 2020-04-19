import DOMPurify from 'purify.min';
import testSuite from './test-suite';
import tests from './fixtures/expect';

const xssTests = tests.filter(function (element) {
  if (/alert/.test(element.payload)) {
    return element;
  }
});

QUnit.module('DOMPurify dist');

testSuite(DOMPurify, window, tests, xssTests);
