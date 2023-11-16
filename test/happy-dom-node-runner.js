/* jshint node: true, esnext: true */
'use strict';

const happyDom = require('happy-dom');
const { Window } = happyDom;

function createWindow() {
  const window = new Window();
  window.document.documentElement.innerHTML = `<html><head></head><body><div id="qunit-fixture"></div></body></html>`;
  require('jquery')(window);
  return window;
}

require('./base-node-runner')(createWindow);
