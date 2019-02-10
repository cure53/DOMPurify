/* jshint node: true, esnext: true */
/* global QUnit */
'use strict';

// Test DOMPurify + jsdom using Node.js (version 8 and up)
const createDOMPurify = require('../dist/purify.cjs');
const jsdom = require('jsdom');
const sanitizeTestSuite = require('./test-suite');
const bootstrapTestSuite = require('./bootstrap-test-suite');
const tests = require('./fixtures/expect');
const xssTests = tests.filter( element => /alert/.test( element.payload ) );

require('qunit-parameterize/qunit-parameterize');

QUnit.assert.contains = function( needle, haystack, message ) {
  const result = haystack.indexOf(needle) > -1;
  this.push(result, needle, haystack, message);
};

QUnit.config.autostart = false;

QUnit.module('DOMPurify - bootstrap', bootstrapTestSuite(jsdom));

jsdom.env({
  html: `<html><head></head><body><div id="qunit-fixture"></div></body></html>`,
  scripts: ['node_modules/jquery/dist/jquery.js'],
  features: {
    ProcessExternalResources: ["script"] // needed for firing the onload event for about:blank iframes
  },
  done(err, window) {
    QUnit.module('DOMPurify in jsdom');
    if (err) {
        console.error('Unexpected error returned by jsdom.env():', err, err.stack);
        process.exit(1);
    }

    if (!window.jQuery) {
        console.warn('Unable to load jQuery');
    }

    const DOMPurify = createDOMPurify(window);
    if (!DOMPurify.isSupported) {
        console.error('Unexpected error returned by jsdom.env():', err, err.stack);
        process.exit(1);
    }

    window.alert = () => {
        window.xssed = true;
    };

    sanitizeTestSuite(DOMPurify, window, tests, xssTests);
    QUnit.start();
  }
});
