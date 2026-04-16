/* Playwright configuration for DOMPurify browser tests.
 * Runs the QUnit suite in real browsers (chromium/firefox/webkit).
 *
 * Local:
 *   npm run test:browser           # all three browsers
 *   npx playwright test --project=chromium
 *
 * CI (non-BrowserStack):
 *   npm run test:browser           # same
 *
 * CI (BrowserStack):
 *   TODO (phase 2b) — drive via browserstack-node-sdk.
 */

const { defineConfig, devices } = require('@playwright/test');

const isCI = Boolean(process.env.CI);
const probeOnly = process.env.TEST_PROBE_ONLY === 'true';

const localProjects = probeOnly
  ? [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
  : [
      { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
      { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
      { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    ];

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
  projects: localProjects,
});
