/* jshint node: true, esnext: true */
/* global QUnit */
'use strict';

// Test DOMPurify + happy-dom using Node.js.
//
// This mirrors test/jsdom-node.js as closely as happy-dom's API allows, so the
// exact same sanitization + XSS suite (test/test-suite.js) runs against a
// happy-dom-backed window.
//
// The jsdom-only bootstrap module (test/bootstrap-test-suite.js) is
// intentionally NOT run here: it exercises script-injection bootstrapping via
// `new JSDOM('<head></head>', { runScripts: 'dangerously' })` and reads
// dist/purify.js into an injected <script>. That tests how DOMPurify *loads*,
// not how it *sanitizes*, and has no faithful happy-dom equivalent.
const createDOMPurify = require('../dist/purify.cjs');
const { Window } = require('happy-dom');

const window = new Window();
// Mirror the jsdom-node.js document: a real <html><head><body> with the
// #qunit-fixture element the suite (and jQuery.html() module) inserts into.
window.document.write(
  `<html><head></head><body><div id="qunit-fixture"></div></body></html>`
);

// Fail loudly if the fixture is missing. Without it, jQuery('#qunit-fixture')
// would silently match nothing and the XSS-via-jQuery.html() tests would pass
// trivially — making happy-dom look safer than it is.
if (!window.document.getElementById('qunit-fixture')) {
  console.error('happy-dom did not create #qunit-fixture; aborting.');
  process.exit(1);
}

require('jquery')(window);

const sanitizeTestSuite = require('./test-suite');

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

  QUnit.module('DOMPurify in happy-dom');

  if (!window.jQuery) {
    console.warn('Unable to load jQuery');
  }

  const DOMPurify = createDOMPurify(window);
  if (!DOMPurify.isSupported) {
    console.error('DOMPurify reports isSupported === false under happy-dom');
    process.exit(1);
  }

  window.alert = () => {
    window.xssed = true;
  };

  sanitizeTestSuite(DOMPurify, window, tests, xssTests);

  // happy-dom keeps its own timers/async tasks alive on the window; close it
  // once QUnit has finished so the Node process can exit cleanly. jsdom does
  // not require this.
  QUnit.done(() => {
    try {
      if (window.happyDOM && typeof window.happyDOM.close === 'function') {
        window.happyDOM.close();
      }
    } catch (error) {
      /* best-effort cleanup */
    }
  });

  QUnit.start();
}

module.exports = startQUnit;
