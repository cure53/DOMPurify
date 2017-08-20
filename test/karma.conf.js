const argv = require('minimist')(process.argv.slice(2));
const isArray = require('lodash.isarray');
const commonjs = require('rollup-plugin-commonjs');
const includePaths = require('rollup-plugin-includepaths');
const rollupConfig = require('../rollup.config.js');
const customLaunchers = require('./karma.custom-launchers.config.js')
  .customLaunchers;
const browsers = require('./karma.custom-launchers.config.js').browsers;

/**
 * Environment variables are passed into the script and the depth of testing
 * is affected accordginly.
 *
 * - Whenever on a PR we only want to probe test with Firefox
 * - Whenever we are on the most recent node version on Travis we test via BrowserStack
 * - If none of the prior mentioned holds we assume to be running local and respect the passed
 *   in borwsers argv
 * - If we did not receive any argv browsers we succeed (other node versions on Travis)
 */
const shouldProbeOnly = argv.shouldProbeOnly !== '';
const shouldTestOnBrowserStack = argv.shouldTestOnBrowserStack !== '';
const browserStackBrowsers = shouldProbeOnly ? ['Firefox'] : browsers;
const karmaBrowsers = shouldTestOnBrowserStack
  ? browserStackBrowsers
  : // eslint-disable-next-line unicorn/no-process-exit
    isArray(argv.browsers) ? argv.browsers.split(' ') : process.exit(0);

rollupConfig.plugins.push(
  commonjs(),
  includePaths({
    include: {
      purify: 'dist/purify.js',
      'purify.min': 'dist/purify.min.js',
    },
  })
);

module.exports = function(config) {
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
    browsers: karmaBrowsers,

    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 1,
    browserNoActivityTimeout: 240000,
    captureTimeout: 240000,

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
