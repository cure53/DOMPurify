/* jshint node: true, esnext: true */
/* global QUnit */
'use strict';

// Test DOMPurify + purify-edge using Node.js.
//
// purify-edge (https://github.com/anzal1/purify-edge) is a third-party package
// that provides a small parse5-based window, so a DOMPurify instance can run
// where jsdom cannot (e.g. Cloudflare Workers). Only the window it exports is
// used here. DOMPurify itself is the build under test (../dist/purify.cjs),
// not the copy that purify-edge depends on.
//
// This mirrors test/happydom-node.js: the same sanitization suite
// (test/test-suite.js) runs against a purify-edge-backed window, and the
// jsdom-only bootstrap module (test/bootstrap-test-suite.js) is not run.
//
// The suite has two kinds of tests. Most only need a DOM, and run on the
// purify-edge window. The "XSS" sink modules and the jQuery v3 mXSS test
// check what a script-executing engine does with sanitized output, which a
// window without a script engine cannot do. Those run in a second pass
// (`--sinks`) where DOMPurify still sanitizes on the purify-edge window and the
// sink (innerHTML, jQuery.html(), iframe document.write()) is a jsdom window.
const createDOMPurify = require('../dist/purify.cjs');
const { window: edgeWindow } = require('purify-edge');

const SINKS = process.argv.includes('--sinks');
const HTML = `<html><head></head><body><div id="qunit-fixture"></div></body></html>`;

// QUnit matches this against "module: test".
const SINK_TESTS = '/^(XSS — |Regression — mXSS: jQuery v3)/';

// A copy, so the package's shared window is not modified. The document is
// replaced by a parsed one with the #qunit-fixture element the suite expects,
// plus the few globals the suite and jQuery read from a window.
const edge = Object.assign({}, edgeWindow);
edge.document = new edge.DOMParser().parseFromString(HTML, 'text/html');
edge.window = edge;
edge.name = '';
edge.location = { href: 'about:blank' };
edge.setTimeout = setTimeout;
edge.clearTimeout = clearTimeout;

let window = edge;
if (SINKS) {
  const { JSDOM, VirtualConsole } = require('jsdom');
  window = new JSDOM(HTML, {
    runScripts: 'dangerously',
    virtualConsole: new VirtualConsole(),
  }).window;
  require('jquery')(window);
}

// Fail loudly if the fixture is missing. Without it the XSS tests would
// silently have nothing to insert into and pass trivially.
if (!window.document.getElementById('qunit-fixture')) {
  console.error('purify-edge did not create #qunit-fixture; aborting.');
  process.exit(1);
}

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
  QUnit.config.filter = (SINKS ? '' : '!') + SINK_TESTS;

  QUnit.module(
    SINKS
      ? 'DOMPurify in purify-edge (sinks in jsdom)'
      : 'DOMPurify in purify-edge'
  );

  // DOMPurify is always built on the purify-edge window.
  const DOMPurify = createDOMPurify(edge);
  if (!DOMPurify.isSupported) {
    console.error('DOMPurify reports isSupported === false under purify-edge');
    process.exit(1);
  }

  window.alert = () => {
    window.xssed = true;
  };

  sanitizeTestSuite(DOMPurify, window, tests, xssTests);

  QUnit.start();
}

module.exports = startQUnit;
