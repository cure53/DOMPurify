/* jshint node: true, esnext: true */
/* global QUnit */
'use strict';

// Test DOMPurify + jsdom using Node.js (version 8 and up)
const createDOMPurify = require('../dist/purify.cjs');
const jsdom = require('jsdom');
const { JSDOM, VirtualConsole } = jsdom;
const virtualConsole = new VirtualConsole();
const { window } = new JSDOM(
  `<html><head></head><body><div id="qunit-fixture"></div></body></html>`,
  { runScripts: 'dangerously', virtualConsole }
);
require('jquery')(window);

const sanitizeTestSuite = require('./test-suite');
const bootstrapTestSuite = require('./bootstrap-test-suite');

async function startQUnit() {
  const { default: tests } = await import('./fixtures/expect.mjs');
  const xssTests = tests.filter((element) => /alert/.test(element.payload));

  QUnit.assert.contains = function (actual, expected, message) {
    const result = expected.indexOf(actual) > -1;
    // Ref: https://api.qunitjs.com/assert/pushResult/
    this.pushResult({
      result: result,
      actual: actual,
      expected: expected,
      message: message,
    });
  };

  QUnit.config.autostart = false;

  QUnit.module('DOMPurify - bootstrap', bootstrapTestSuite(JSDOM));

  QUnit.module('DOMPurify in jsdom');

  if (!window.jQuery) {
    console.warn('Unable to load jQuery');
  }

  const DOMPurify = createDOMPurify(window);
  if (!DOMPurify.isSupported) {
    console.error('Unexpected error returned by jsdom.env():', err, err.stack);
    process.exit(1);
  }

  window.alert = () => {
    window.xssed = true;
  };

  sanitizeTestSuite(DOMPurify, window, tests, xssTests);
  QUnit.start();
}

module.exports = startQUnit;
