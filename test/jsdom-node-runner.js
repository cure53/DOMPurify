/* jshint node: true, esnext: true */
'use strict';

const jsdom = require('jsdom');
const { JSDOM, VirtualConsole } = jsdom;
const virtualConsole = new VirtualConsole();

function createWindow() {
  const { window } = new JSDOM(
    `<html><head></head><body><div id="qunit-fixture"></div></body></html>`,
    { runScripts: 'dangerously', virtualConsole }
  );
  require('jquery')(window);
  return window;
}

require('./base-node-runner')(createWindow);
