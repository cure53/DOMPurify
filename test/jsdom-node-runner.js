/* jshint node: true, esnext: true */
'use strict';

const jsdom = require('jsdom');
const { JSDOM, VirtualConsole } = jsdom;

const {run, documentHtml} = require('./base-node-runner');

function createWindow() {
  const virtualConsole = new VirtualConsole();
  const { window } = new JSDOM(
    documentHtml,
    { runScripts: 'dangerously', virtualConsole }
  );
  require('jquery')(window);
  return window;
}

run(createWindow);
