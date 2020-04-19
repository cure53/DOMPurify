const commonjs = require('rollup-plugin-commonjs');
const includePaths = require('rollup-plugin-includepaths');
const rollupConfig = require('../rollup.config.js');
const customLaunchers = require('./karma.custom-launchers.config.js')
  .customLaunchers;
const browsers = require('./karma.custom-launchers.config.js').browsers;

rollupConfig.plugins.push(
  commonjs(),
  includePaths({
    include: {
      purify: 'dist/purify.js',
      'purify.min': 'dist/purify.min.js',
    },
  })
);

rollupConfig.output.format = 'umd';

module.exports = function (config) {
  config.set({
    autoWatch: true,
    basePath: '../',
    frameworks: ['qunit'],
    files: [
      'node_modules/jquery/dist/jquery.js',
      'node_modules/qunit-parameterize/qunit-parameterize.js',
      'test/config/setup.js',
      'test/**/*.spec.js',
    ],

    preprocessors: {
      'src/*.js': ['rollup'],
      'test/**/*.spec.js': ['rollup'],
    },

    reporters: ['progress'],

    exclude: [],
    port: 9876,

    browserStack: {
      project: 'DOMPurify',
      username: process.env.BS_USERNAME,
      accessKey: process.env.BS_ACCESSKEY,
    },

    rollupPreprocessor: rollupConfig,

    customLaunchers,
    browsers,

    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 1,
    browserNoActivityTimeout: 30000,
    captureTimeout: 360000,

    plugins: [
      'karma-chrome-launcher',
      'karma-browserstack-launcher',
      'karma-firefox-launcher',
      'karma-qunit',
      'karma-rollup-preprocessor',
    ],

    singleRun: true,
    colors: true,
    logLevel: config.LOG_INFO,
  });
};
