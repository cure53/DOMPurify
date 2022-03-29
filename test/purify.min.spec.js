import 'purify.min';
import './test-suite';
import tests from './fixtures/expect';

const xssTests = tests.filter(function (element) {
  if (/alert/.test(element.payload)) {
    return element;
  }
});

QUnit.module('DOMPurify dist');

testSuite(DOMPurify, window, tests, xssTests);
