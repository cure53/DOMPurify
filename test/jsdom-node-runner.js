/* jshint node: true, esnext: true */
/* global QUnit */
'use strict';

global.QUnit = require('qunit');

const qunitTap = require('qunit-tap');
const argument = process.argv[2];

qunitTap(QUnit, (line) => {
  if (/^not ok/.test(line)) {
    process.exitCode = 1;
    return console.log('\n', line);
  }

  if (argument === '--dot') {
    return process.stdout.write('.');
  }

  console.log(line);
});

require('./jsdom-node');

QUnit.load();
