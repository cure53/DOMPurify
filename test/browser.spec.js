/* Playwright test: loads each HTML runner, waits for QUnit to finish,
 * surfaces failure details, and asserts zero failures.
 *
 * The actual assertion logic lives in /test/test-suite.js (unchanged from the
 * Karma era). This file only orchestrates the browser and reports results.
 */

'use strict';

const { test, expect } = require('@playwright/test');

const suites = [
  { label: 'purify.js', path: '/test/browser/index.html' },
  { label: 'purify.min.js', path: '/test/browser/index.min.html' },
];

for (const suite of suites) {
  test(`${suite.label} — QUnit suite passes`, async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (err) => {
      pageErrors.push(err.stack || err.message);
    });

    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto(suite.path);

    /* Wait for QUnit to finish (entry.js flips window.__qunitDone__).
     * Playwright's waitForFunction polls; 100 ms is a reasonable cadence for
     * a test suite that takes ~5–30 s in practice. */
    await page.waitForFunction(() => window.__qunitDone__ === true, null, {
      timeout: 90_000,
      polling: 100,
    });

    const { result, failures } = await page.evaluate(() => ({
      result: window.__qunitResult__,
      failures: window.__qunitFailures__,
    }));

    /* If tests failed, print per-assertion detail to the Playwright output so
     * CI logs surface the root cause rather than just "N tests failed". */
    if (failures.length > 0) {
      const lines = ['', `${failures.length} QUnit test(s) reported failures:`];
      for (const f of failures) {
        lines.push(`  ${f.module} > ${f.name}  (${f.failed}/${f.total})`);
        for (const a of f.assertions) {
          lines.push(`    - ${a.message || '(no message)'}`);
          lines.push(`        expected: ${JSON.stringify(a.expected)}`);
          lines.push(`        actual:   ${JSON.stringify(a.actual)}`);
        }
      }
      // eslint-disable-next-line no-console
      console.error(lines.join('\n'));
    }

    expect(
      pageErrors,
      `uncaught page error(s):\n${pageErrors.join('\n---\n')}`
    ).toEqual([]);

    expect(
      result.failed,
      `${result.failed} of ${result.total} QUnit assertions failed`
    ).toBe(0);

    /* Sanity check — if for some reason tests didn't actually run, fail loudly
     * rather than pass silently. */
    expect(result.total, 'QUnit reported zero total tests').toBeGreaterThan(0);

    /* Record a light-touch summary line in the pass case. */
    // eslint-disable-next-line no-console
    console.log(
      `  ${suite.label}: ${result.passed}/${result.total} passed in ${result.runtime} ms`
    );

    /* Console errors from the browser aren't necessarily test failures
     * (some tests intentionally provoke errors), so we don't assert on them.
     * But if a fail occurs AND there were console errors, include them in the
     * diagnostic output. */
    if (failures.length > 0 && consoleErrors.length > 0) {
      // eslint-disable-next-line no-console
      console.error(
        `browser console errors during failing run:\n  ${consoleErrors.join('\n  ')}`
      );
    }
  });
}
