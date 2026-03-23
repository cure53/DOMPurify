const includePaths = require('rollup-plugin-includepaths');
const rollupConfig = require('../rollup.config.js')[0];
const customLaunchers =
  require('./karma.custom-launchers.config.js').customLaunchers;
const browsers = require('./karma.custom-launchers.config.js').browsers;

rollupConfig.plugins.push(
  includePaths({
    include: {
      purify: 'dist/purify.js',
      'purify.min': 'dist/purify.min.js',
    },
  })
);

// Karma-Rollup-Preprocessor expects a single output object
if (Array.isArray(rollupConfig.output)) {
  rollupConfig.output = rollupConfig.output[0];
}

// Rollup 3+ compatibility and avoiding export errors for specs
rollupConfig.output.format = 'umd';
rollupConfig.output.exports = 'auto';

module.exports = function (config) {
  config.set({
    autoWatch: true,
    basePath: '../',
    frameworks: ['qunit'],
    files: [
      'node_modules/jquery/dist/jquery.js',
      'test/config/setup.js',
      'test/purify.spec.js',
      'test/purify.min.spec.js',
    ],

    preprocessors: {
      'src/*.ts': ['rollup'],
      'test/purify.spec.js': ['rollup'],
      'test/purify.min.spec.js': ['rollup'],
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
