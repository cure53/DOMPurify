import { test as nodeTest } from 'node:test';
import assert from 'node:assert';
import { JSDOM, VirtualConsole } from 'jsdom';
import jquery from 'jquery';
import fs from 'node:fs';
import createDOMPurify from '../dist/purify.cjs.js';
import tests from './fixtures/expect.mjs';

const virtualConsole = new VirtualConsole();
const { window } = new JSDOM(
  `<html><head></head><body><div id="qunit-fixture"></div></body></html>`,
  { runScripts: 'dangerously', virtualConsole }
);
jquery(window);

window.alert = () => {
  window.xssed = true;
};
window.name = 'nodejs';

const DOMPurify = createDOMPurify(window);

const xssTests = tests.filter((element) => /alert/.test(element.payload));

function wrapAssert(fn) {
  return async (t) => {
    const promises = [];
    const shimmedAssert = {
      equal: (a, b, m) => {
        if (
          typeof a === 'object' &&
          a !== null &&
          b !== null &&
          typeof b !== 'object'
        ) {
          assert.equal(a.toString(), b, m);
        } else {
          assert.equal(a, b, m);
        }
      },
      notEqual: (a, b, m) => assert.notEqual(a, b, m),
      strictEqual: (a, b, m) => assert.strictEqual(a, b, m),
      ok: (v, m) => assert.ok(v, m),
      throws: (f, m) => assert.throws(f, m),
      contains: (actual, expected, message) => {
        let result = Array.isArray(expected)
          ? expected.some((e) => actual === e)
          : actual === expected;
        assert.ok(
          result,
          message ||
            `Expected ${JSON.stringify(actual)} to be in ${JSON.stringify(
              expected
            )}`
        );
      },
      async: () => {
        let resolve;
        const p = new Promise((r) => (resolve = r));
        promises.push(p);
        return resolve;
      },
      expect: () => {},
    };
    await fn(shimmedAssert);
    await Promise.all(promises);
  };
}

const bootstrapTestSuite = (await import('./bootstrap-test-suite.js')).default;
const testSuite = (await import('./test-suite.js')).default;

const wrappedTest = (name, fn) => nodeTest(name, wrapAssert(fn));

bootstrapTestSuite(JSDOM, wrappedTest, fs, jquery);
testSuite(wrappedTest, DOMPurify, window, tests, xssTests);
