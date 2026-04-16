/* Browser test entry. Loaded as an ES module by index.html and index.min.html.
 * Runs after the classic scripts (QUnit, jQuery, DOMPurify, setup, test-suite)
 * have executed and populated window globals.
 */

import tests from '/test/fixtures/expect.mjs';

const xssTests = tests.filter((element) => /alert/.test(element.payload));

/* Expose hooks that the Playwright runner polls. */
window.__qunitDone__ = false;
window.__qunitResult__ = null;
window.__qunitFailures__ = [];

QUnit.testDone((details) => {
  if (details.failed > 0) {
    window.__qunitFailures__.push({
      module: details.module,
      name: details.name,
      failed: details.failed,
      total: details.total,
      assertions: details.assertions
        .filter((a) => !a.result)
        .map((a) => ({
          message: a.message || null,
          expected: a.expected,
          actual: a.actual,
          source: a.source || null,
        })),
    });
  }
});

QUnit.done((details) => {
  window.__qunitResult__ = {
    passed: details.passed,
    failed: details.failed,
    total: details.total,
    runtime: details.runtime,
  };
  window.__qunitDone__ = true;
});

QUnit.module(window.__SUITE_NAME__ || 'DOMPurify');

/* testSuite is a UMD-exported function defined in /test/test-suite.js. In a
 * plain browser context it attaches itself to globalThis. */
// eslint-disable-next-line no-undef
testSuite(DOMPurify, window, tests, xssTests);

QUnit.start();
