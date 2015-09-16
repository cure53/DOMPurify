module.exports = function(config) {
  config.set({
    autoWatch: true,
    basePath: '../',
    frameworks: ['qunit'],
    files: [
      'bower_components/jQuery/dist/jquery.js',
      'node_modules/qunit-parameterize/qunit-parameterize.js',
      'test/**/*.spec.js'
    ],

    preprocessors: {
      'src/**/*.js': ['webpack'],
      'test/**/*.js': ['webpack']
    },

    reporters: ['progress'],

    exclude: [],
    port: 9876,

    browserStack: {
      project: 'DOMPurify',
      username: process.env.BS_USERNAME,
      accessKey: process.env.BS_ACCESSKEY
    },

    webpack: {
      plugins: [],
      devtool: 'inline-source-map',
      resolve: {
        alias: {},
        modulesDirectories: [
          'test',
          'src'
        ],
        extensions: ['', '.js', '.json']
      },
      externals: {
        jQuery: 'jQuery'
      },
      module: {
        loaders: [{
          test: /\.json$/,
          loader: 'json-loader'
        }]
      }
    },

    customLaunchers: {
      bs_win81_ie_11: {
        base: 'BrowserStack',
        browser: 'ie',
        browser_version: '11.0',
        os: 'Windows',
        os_version: '8.1'
      },
      bs_win8_ie_10: {
        base: 'BrowserStack',
        browser: 'ie',
        browser_version: '10.0',
        os: 'Windows',
        os_version: '8'
      },
      bs_mavericks_chrome_44: {
        base: 'BrowserStack',
        device: null,
        os: 'OS X',
        browser_version: '44.0',
        browser: 'chrome',
        os_version: 'Mavericks'
      },
      bs_yosemite_firefox_40: {
        base: 'BrowserStack',
        device: null,
        os: 'OS X',
        browser_version: '40.0',
        browser: 'firefox',
        os_version: 'Yosemite'
      },
      bs_win81_opera31: {
        base: 'BrowserStack',
        device: null,
        os: 'Windows',
        browser_version: '31',
        browser: 'opera',
        os_version: '8.1'
      }
    },

    browsers: [
      'bs_win81_ie_11',
      'bs_win8_ie_10',
      'bs_mavericks_chrome_44',
      'bs_yosemite_firefox_40',
      'bs_win81_opera31'
    ],

    plugins: [
      'karma-webpack',
      'karma-chrome-launcher',
      'karma-browserstack-launcher',
      'karma-firefox-launcher',
      'karma-qunit'
    ],

    singleRun: true,
    colors: true,
    logLevel: config.LOG_INFO
  });
};
