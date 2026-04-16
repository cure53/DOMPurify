/* Playwright spec for the QUnit browser tests.
 *
 * One test per QUnit suite (purify.js + purify.min.js). The browser is
 * supplied by Playwright projects configured in playwright.config.js
 * (chromium / firefox / webkit). Which projects run depends on the
 * script invoked:
 *
 *   npm test             -> chromium only (via --project=chromium)
 *   npm run test:browser -> all three engines
 */

'use strict';

const { test } = require('@playwright/test');

const SUITES = [
  { label: 'purify.js', urlPath: '/test/browser/index.html' },
  { label: 'purify.min.js', urlPath: '/test/browser/index.min.html' },
];

async function runQUnitInPage(page, urlPath) {
  await page.goto(urlPath);
  await page.waitForFunction(() => window.__qunitDone__ === true, null, {
    timeout: 120_000,
  });
  return page.evaluate(() => ({
    passed: window.__qunitResult__.passed,
    failed: window.__qunitResult__.failed,
    total: window.__qunitResult__.total,
    duration: window.__qunitResult__.runtime,
    failures: window.__qunitFailures__ || [],
  }));
}

function formatFailures(failures) {
  if (!failures || failures.length === 0) return '';
  const shown = failures.slice(0, 25);
  const more =
    failures.length > shown.length
      ? `\n  ... and ${failures.length - shown.length} more`
      : '';
  return (
    shown
      .map((f) => {
        const mod = f.module ? `${f.module} > ` : '';
        return `  - ${mod}${f.name}\n      expected: ${JSON.stringify(
          f.expected
        )}\n      actual:   ${JSON.stringify(f.actual)}`;
      })
      .join('\n') + more
  );
}

for (const suite of SUITES) {
  test(`${suite.label} — QUnit suite passes`, async ({ page }) => {
    const result = await runQUnitInPage(page, suite.urlPath);

    if (result.failed > 0) {
      throw new Error(
        `${result.failed}/${result.total} QUnit tests failed:\n${formatFailures(result.failures)}`
      );
    }

    // eslint-disable-next-line no-console
    console.log(
      `  ${suite.label}: ${result.passed}/${result.total} passed in ${result.duration} ms`
    );
  });
}
