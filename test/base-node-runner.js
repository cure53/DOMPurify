/* jshint node: true, esnext: true */
/* global QUnit */
'use strict';

global.QUnit = require('qunit');

const qunitTap = require('qunit-tap');
const argument = process.argv[2];

const createDOMPurify = require('../dist/purify.cjs');

const sanitizeTestSuite = require('./test-suite');
const bootstrapTestSuite = require('./bootstrap-test-suite');

async function run(createWindow) {
  qunitTap(QUnit, (line) => {
    if (/^not ok/.test(line)) {
      process.exitCode = 1;
      return console.log('\n', line);
    }

    if (argument === '--dot') {
      return process.stdout.write('.');
    }

    console.log(line);
  });

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

  QUnit.module('DOMPurify - bootstrap', bootstrapTestSuite(createWindow));

  QUnit.module('DOMPurify in jsdom');

  const window = createWindow();
  const DOMPurify = createDOMPurify(window);
  if (!DOMPurify.isSupported) {
    console.error('DOMPurify reports as not supported');
    process.exit(1);
  }

  window.alert = () => {
    window.xssed = true;
  };

  sanitizeTestSuite(DOMPurify, window, tests, xssTests);
  QUnit.start();

  QUnit.load()
}

module.exports = {
  run,
  documentHtml: `<html>
    <head><</head>
    <body><div id="qunit-fixture"></div></body>
  </html>`
};
