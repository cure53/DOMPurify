import { test, expect } from '@playwright/test';

test('DOMPurify Test Suite', async ({ page }) => {
    // Navigate to the test page.
    await page.goto(`/test/index.html`, { waitUntil: 'domcontentloaded' });

    // Wait for the tests to finish
    await page.waitForFunction(() => window.testsFinished === true, {
        timeout: 60000,
        polling: 1000
    });

    const results = await page.evaluate(() => window.testResults);
    const failed = results.filter(r => !r.pass);

    if (failed.length > 0) {
        console.error('Failed Tests (first 10):', JSON.stringify(failed.slice(0, 10), null, 2));
    }

    expect(failed.length).toBe(0);
});
