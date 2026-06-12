/* Library-mode runner for older Playwright snapshots.
 *
 * Loads the served QUnit suite (test/browser/index.html and index.min.html) in
 * Chromium, Firefox and WebKit, waits for window.__qunitDone__, and asserts
 * window.__qunitResult__.failed === 0. It uses only launch / newPage / goto /
 * waitForFunction / evaluate, all stable since Playwright 1.x, so the same file
 * drives any pinned Playwright build.
 *
 * Which Playwright to drive:
 *   PW_MODULE   absolute path to an isolated install (CI legacy snapshots).
 *               Falls back to the repo's own playwright / @playwright/test so
 *               `npm run test:browser:legacy` works locally on current browsers.
 *   PW_ENGINES  comma list to restrict engines (default: chromium,firefox,webkit).
 *
 * Server:
 *   BASE_URL    if set, the runner uses it and does not manage a server.
 *               if unset, it reuses a server already on PORT, else starts
 *               test/browser/server.js itself and stops it on exit (mirrors what
 *               config/playwright.config.js does for the main spec).
 *   PORT        server port (default 9877, same default as server.js).
 */
'use strict';

const http = require('http');
const path = require('path');
const { spawn } = require('child_process');

function loadPlaywright() {
  const id = process.env.PW_MODULE;
  if (id) {
    return require(id);
  }

  try {
    return require('playwright');
  } catch (_) {
    // Fall back to the test runner package, which re-exports the engines.
    return require('@playwright/test');
  }
}

const SUITES = ['/test/browser/index.html', '/test/browser/index.min.html'];
const PORT = Number.parseInt(process.env.PORT || '9877', 10);

function httpStatus(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve(res.statusCode);
    });
    req.on('error', reject);
    req.setTimeout(2000, () => req.destroy(new Error('timeout')));
  });
}

async function reachable(url) {
  try {
    return (await httpStatus(url)) === 200;
  } catch (_) {
    return false;
  }
}

async function waitForServer(base, tries = 60) {
  for (let i = 0; i < tries; i++) {
    if (await reachable(base + SUITES[0])) {
      return;
    }

    await new Promise((r) => setTimeout(r, 500));
  }

  throw new Error('test server did not come up at ' + base);
}

async function startServer() {
  if (process.env.BASE_URL) {
    return { base: process.env.BASE_URL, stop() {} };
  }

  const base = 'http://127.0.0.1:' + PORT;
  if (await reachable(base + SUITES[0])) {
    return { base, stop() {} };
  }

  const child = spawn(process.execPath, [path.join(__dirname, 'server.js')], {
    stdio: 'ignore',
    env: { ...process.env, PORT: String(PORT) },
  });
  await waitForServer(base);
  return {
    base,
    stop() {
      child.kill();
    },
  };
}

async function runSuite(browser, name, version, base) {
  let failed = 0;
  for (const suite of SUITES) {
    const page = await browser.newPage();
    try {
      await page.goto(base + suite);
      await page.waitForFunction(() => window.__qunitDone__ === true, null, {
        timeout: 90_000,
      });
      const result = await page.evaluate(() => window.__qunitResult__);
      const ok = result && result.failed === 0 && result.total > 0;
      const passed = result ? result.passed : 0;
      const total = result ? result.total : 0;
      console.log(
        (ok ? 'PASS' : 'FAIL') +
          ' ' + name + ' ' + version + ' ' + suite +
          ': ' + passed + '/' + total + ' passed' +
          (result && result.failed ? ', ' + result.failed + ' failed' : '')
      );
      if (!ok) {
        failed++;
        const fails = await page.evaluate(() => window.__qunitFailures__);
        for (const f of fails || []) {
          console.error('    ' + f.module + ' > ' + f.name + ' (' + f.failed + '/' + f.total + ')');
        }
      }
    } finally {
      await page.close();
    }
  }

  return failed;
}

async function main() {
  const pw = loadPlaywright();
  const engines = {
    chromium: pw.chromium,
    firefox: pw.firefox,
    webkit: pw.webkit,
  };
  const wanted = (process.env.PW_ENGINES || 'chromium,firefox,webkit')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const { base, stop } = await startServer();
  let failed = 0;
  try {
    for (const name of wanted) {
      const type = engines[name];
      if (!type) {
        console.error('SKIP ' + name + ': unknown engine');
        continue;
      }

      let browser;
      try {
        browser = await type.launch();
      } catch (err) {
        console.error('FAIL ' + name + ': could not launch (' + String(err.message).split('\n')[0] + ')');
        failed++;
        continue;
      }

      try {
        const version = browser.version ? browser.version() : '?';
        failed += await runSuite(browser, name, version, base);
      } finally {
        await browser.close();
      }
    }
  } finally {
    stop();
  }

  if (failed > 0) {
    console.error('\n' + failed + ' engine/suite combination(s) failed');
    process.exitCode = 1;
  } else {
    console.log('\nall legacy engines passed');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
