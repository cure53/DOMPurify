/* Playwright configuration for DOMPurify browser tests.
 * Runs the QUnit suite in real browsers via Playwright's managed binaries.
 *
 * Browser coverage:
 *   npm test              -> chromium only (fast local dev / PR feedback)
 *   npm run test:browser  -> chromium + firefox + webkit (full engine coverage)
 *
 * The CI workflow's "browser-matrix" job runs test:browser on three OS runners
 * (ubuntu, macOS, Windows) giving 9 browser/OS combinations in parallel.
 */

const { defineConfig, devices } = require('@playwright/test');

const isCI = Boolean(process.env.CI);

module.exports = defineConfig({
  testDir: './test',
  testMatch: ['browser.spec.js'],
  timeout: 120_000,
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:9877',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'node test/browser/server.js',
    port: 9877,
    reuseExistingServer: !isCI,
    stdout: 'ignore',
    stderr: 'pipe',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
