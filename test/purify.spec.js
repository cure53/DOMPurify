import 'purify';
import './test-suite';
import './bootstrap-test-suite';
import tests from './fixtures/expect.mjs';

var xssTests = tests.filter(function (element) {
  if (/alert/.test(element.payload)) {
    return element;
  }
});

QUnit.module('DOMPurify src');

bootstrapTestSuite(null, QUnit.test, null, window.jQuery);
testSuite(QUnit.test, DOMPurify, window, tests, xssTests);
