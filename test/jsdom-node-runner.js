/* jshint node: true, esnext: true */
/* global QUnit */
'use strict';

global.QUnit = require('qunitjs');
const qunitTap = require('qunit-tap');

qunitTap(QUnit, line => {
    if (/^not ok/.test(line)) {
        process.exitCode = 1;
    }
    console.log(line);
});

require('./jsdom-node');

QUnit.load();
