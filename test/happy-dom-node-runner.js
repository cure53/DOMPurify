/* jshint node: true, esnext: true */
'use strict';

const happyDom = require('happy-dom');
const { Window } = happyDom;

const {run, documentHtml} = require('./base-node-runner');

function createWindow() {
  const window = new Window();
  window.document.documentElement.innerHTML = documentHtml;
  require('jquery')(window);
  return window;
}

run(createWindow, 'happy-dom');
